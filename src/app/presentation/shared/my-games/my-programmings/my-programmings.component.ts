import { Component, OnChanges, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MyProgrammingGamesService } from '../../../../core/infrastructure/api/my-programming-games.service';
import { MyProgrammingGame } from '../../../../core/domain/model/my-programming-game.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UserSessionService } from '../../../../core/infrastructure/service/user-session.service';
import { ProgrammingStatusService } from '../../../../core/infrastructure/api/programming-status.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { GameReportResponse } from '../../../../core/domain/interface/game-report-response';
import ApexCharts from 'apexcharts';
import { GameReportService } from '../../../../core/infrastructure/api/game-report.service';
@Component({
  selector: 'app-my-programmings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-programmings.component.html',
  styleUrl: './my-programmings.component.css',
})
export class MyProgrammingsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() gameId: number | null = null;

  activities: MyProgrammingGame[] = [];
  mobileMenuOpen = false;
  private activitiesPerPage = 6;
  private currentPage = 1;
  selectedTab: string = 'Todos';
  startDate: string = '';
  endDate: string = '';
  menuAbierto: number | null = null;
  showReportModal: boolean = false;
  reportGameInstanceId: number | null = null;
  tabs: string[] = [
    'Todos',
    'Ahorcado',
    'Rompecabezas',
    'Memoria',
    'Pupiletras',
  ];
  totalActivities: number = 0;
  userId: number = 0;
  isScrolled = false;
  private subscription = new Subscription();
  constructor(
    private myProgrammingGamesService: MyProgrammingGamesService,
    private route: ActivatedRoute,
    private router: Router,
    private userSession: UserSessionService,
    private programmingStatusService: ProgrammingStatusService,
    private gameReportService: GameReportService // Corregido: inyectar correctamente el servicio
  ) {}

  ngOnInit() {
    this.initializeComponent();
    this.subscription.add(
      this.route.queryParams.subscribe((params) => {
        this.gameId = params['gameId'] ? +params['gameId'] : null;
        this.resetPagination();
        if (this.userId) {
          this.loadProgrammings();
        }
      })
    );
    window.addEventListener('scroll', this.onScroll.bind(this));
    // Agregar listener para cerrar menús al hacer clic fuera
    document.addEventListener('click', this.closeMenus.bind(this));
  }

  private initializeComponent(): void {
    // Verificar si ya tenemos userId y token
    this.userId = this.userSession.getUserId() || 0;
    
    if (this.userId && this.userSession.isAuthenticated()) {
      console.log('[MyProgrammings] Usuario y token disponibles');
      this.loadProgrammings();
    } else {
      console.log('[MyProgrammings] Esperando token y userId...');
      // Esperar tanto el token como el userId
      this.subscription.add(
        this.userSession.waitForToken$(5000).subscribe({
          next: (token) => {
            console.log('[MyProgrammings] Token recibido');
            this.waitForUserId();
          },
          error: (err) => {
            console.error('[MyProgrammings] Error esperando token:', err);
          }
        })
      );
    }
  }

  private waitForUserId(): void {
    this.subscription.add(
      this.userSession.userId$.subscribe(userId => {
        if (userId) {
          console.log('[MyProgrammings] UserId recibido:', userId);
          this.userId = userId;
          this.loadProgrammings();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    // Remover listener cuando se destruya el componente
    window.removeEventListener('scroll', this.onScroll.bind(this));
    document.removeEventListener('click', this.closeMenus.bind(this));
  }

  onScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  ngOnChanges() {
    this.resetPagination();
    this.loadProgrammings();
  }

  loadProgrammings(loadMore: boolean = false): void {
    const gameType =
      this.selectedTab === 'Todos'
        ? 'all'
        : this.mapTabToType(this.selectedTab);
    const limit = this.activitiesPerPage;
    const offset = loadMore ? (this.currentPage - 1) * limit : 0;
    let startDate = '',
      endDate = '',
      exactStartDate = '',
      exactEndDate = '';
    if (this.startDate && this.endDate) {
      startDate = this.startDate;
      endDate = this.endDate;
      exactStartDate = '';
      exactEndDate = '';
    } else if (this.startDate && !this.endDate) {
      exactStartDate = this.startDate;
      startDate = '';
      endDate = '';
      exactEndDate = '';
    } else if (!this.startDate && this.endDate) {
      exactEndDate = this.endDate;
      startDate = '';
      endDate = '';
      exactStartDate = '';
    } else {
      startDate = '';
      endDate = '';
      exactStartDate = '';
      exactEndDate = '';
    }
    this.myProgrammingGamesService
      .getMyProgrammingGames(
        this.userId,
        gameType,
        limit,
        offset,
        startDate,
        endDate,
        exactStartDate,
        exactEndDate
      )
      .subscribe({
        next: (res) => {
          if (res && res.data && Array.isArray(res.data.data)) {
            if (loadMore && offset > 0) {
              this.activities = [...this.activities, ...res.data.data];
            } else {
              this.activities = res.data.data;
            }
            this.totalActivities = res.data.total;
          } else {
            this.activities = [];
          }
        },
        error: (err) => {
          this.activities = [];
          console.error('Error al cargar programaciones:', err);
        },
      });
  }

  getPaginatedActivities() {
    return this.activities;
  }

  hasMoreActivities(): boolean {
    return this.activities.length < this.totalActivities;
  }

  loadMore(): void {
    this.currentPage++;
    this.loadProgrammings(true);
  }

  resetPagination(): void {
    this.currentPage = 1;
    this.activities = [];
  }

  onTabChange(tab: string): void {
    this.selectedTab = tab;
    this.resetPagination();
    this.loadProgrammings();
  }

  onDateChange(): void {
    this.resetPagination();
    this.loadProgrammings();
  }

  mapTabToType(tab: string): string {
    switch (tab) {
      case 'Ahorcado':
        return 'hangman';
      case 'Rompecabezas':
        return 'puzzle';
      case 'Memoria':
        return 'memory';
      case 'Pupiletras':
        return 'solve_the_word';
      default:
        return 'all';
    }
  }

  getDifficultyClass(difficulty: number): string {
    if (difficulty <= 60) return 'bg-[#C9FFD0]';
    if (difficulty <= 180) return 'bg-[#FFFEC2]';
    return 'bg-[#FFB4B4]';
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'hangman':
        return '🎯';
      case 'puzzle':
        return '🧩';
      case 'memory':
        return '🃏';
      case 'solve_the_word':
        return '📝';
      default:
        return '📚';
    }
  }

  editarActividad(id: number) {
    this.menuAbierto = null;
    console.log('Editar actividad', id);
  }

  showOptions(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.menuAbierto = this.menuAbierto === id ? null : id;
  }

  closeMenus(): void {
    this.menuAbierto = null;
  }
  verReporte(id: number): void {
    this.reportGameInstanceId = id;
    this.menuAbierto = null;

    // Mostrar el modal con SweetAlert2
    Swal.fire({
      title: 'Reporte de Juego',
      html: '<div id="chart-container" style="min-height: 400px;"></div>',
      width: 800,
      showCloseButton: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      customClass: {
        popup: 'report-modal-popup',
      },
      didOpen: () => {
        this.loadReportData(id);
      },
    });
  }

  private loadReportData(gameInstanceId: number): void {
    // Mostrar loading
    const container = document.getElementById('chart-container');
    if (container) {
      container.innerHTML = '<div class="text-center py-8"><div class="spinner-border text-purple-600" role="status"></div><p class="mt-2">Cargando reporte...</p></div>';
    }

    this.gameReportService.getReport(gameInstanceId.toString()).subscribe({ // Corregido: uso de this.gameReportService
      next: (res: GameReportResponse) => {
        this.renderReportChart(res.data);
      },
      error: (error) => {
        if (container) {
          container.innerHTML = '<div class="text-center text-red-500 py-8"><i class="fas fa-exclamation-triangle mb-2"></i><p>No se pudo cargar el reporte</p></div>';
        }
      }
    });
  }

  private renderReportChart(data: any): void {
    const container = document.getElementById('chart-container');
    if (!container) return;

    // Para el JSON que muestras, crear un gráfico simple
    const options = {
      chart: {
        type: 'donut',
        height: 350,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      series: [data.sessions_count || 0, data.average_rating || 0],
      labels: ['Sesiones Totales', 'Rating Promedio'],
      colors: ['#7C3AED', '#38BDF8'],
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                formatter: () => `ID: ${data.game_instance_id}`
              }
            }
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(1)}%`
      },
      legend: {
        position: 'bottom',
        fontSize: '14px'
      },
      tooltip: {
        y: {
          formatter: (val: number, opts: any) => {
            const label = opts.w.globals.labels[opts.seriesIndex];
            return label === 'Sesiones Totales' ? `${val} sesiones` : `${val.toFixed(1)} rating`;
          }
        }
      }
    };

    const chart = new ApexCharts(container, options);
    chart.render();

    // Agregar información adicional debajo del gráfico
    setTimeout(() => {
      const infoDiv = document.createElement('div');
      infoDiv.className = 'mt-4 p-4 bg-gray-50 rounded-lg';
      infoDiv.innerHTML = `
        <div class="grid grid-cols-3 gap-4 text-center">
          <div class="bg-white p-3 rounded-lg shadow-sm">
            <div class="text-2xl font-bold text-purple-600">${data.game_instance_id}</div>
            <div class="text-sm text-gray-600">ID Instancia</div>
          </div>
          <div class="bg-white p-3 rounded-lg shadow-sm">
            <div class="text-2xl font-bold text-blue-600">${data.sessions_count}</div>
            <div class="text-sm text-gray-600">Sesiones</div>
          </div>
          <div class="bg-white p-3 rounded-lg shadow-sm">
            <div class="text-2xl font-bold text-green-600">${data.average_rating.toFixed(1)}</div>
            <div class="text-sm text-gray-600">Rating Promedio</div>
          </div>
        </div>
      `;
      container.appendChild(infoDiv);
    }, 100);
  }



  closeReportModal() {
    this.showReportModal = false;
    this.reportGameInstanceId = null;
  }
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  changeStatusActivity(activity: MyProgrammingGame): void {
    const isActive = activity.status === 1;
    const newStatus = isActive ? 0 : 1; // Si está activo (1), será 0 (restringido), si está inactivo (0), será 1 (público)
    const confirmText = isActive ? '¿Deseas hacer esta programación restringida?' : '¿Deseas hacer esta programación pública?';
    const successText = isActive ? 'La programación ahora es restringida.' : 'La programación ahora es pública.';
    const confirmButton = isActive ? 'Sí, restringir' : 'Sí, hacer pública';
    
    console.log('Estado actual de la programación:', {
      gameInstanceId: activity.game_instance_id,
      currentStatus: activity.status,
      isActive: isActive,
      newStatus: newStatus
    });
    
    Swal.fire({
      title: 'Cambiar estado',
      text: confirmText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8571FB',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButton,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Enviando request:', { gameInstanceId: activity.game_instance_id, status: newStatus });
        
        this.programmingStatusService.setProgrammingGameStatus(activity.game_instance_id, newStatus).subscribe({
          next: (response) => {
            console.log('✅ Respuesta del servidor:', response);
            this.menuAbierto = null;
            
            // Actualizar localmente el estado usando la respuesta del servidor
            if (response.data && typeof response.data.status === 'number') {
              activity.status = response.data.status;
              console.log('🎯 Estado actualizado desde servidor:', response.data.status);
            } else {
              // Fallback en caso de que el backend aún no esté actualizado
              activity.status = newStatus;
              console.log('🔄 Estado actualizado localmente (fallback):', newStatus);
            }
            
            Swal.fire('Actualizado', successText, 'success');
            
            // Opcional: recargar solo si es necesario
            // this.resetPagination();
            // this.loadProgrammings();
          },
          error: (err) => {
            this.menuAbierto = null;
            console.error('Error completo al cambiar estado:', {
              error: err,
              gameInstanceId: activity.game_instance_id,
              attemptedStatus: newStatus,
              errorMessage: err.error?.message || err.message,
              statusCode: err.status
            });
            
            let errorMessage = 'No se pudo cambiar el estado de la programación.';
            if (err.status === 401) {
              errorMessage = 'No tienes autorización para realizar esta acción.';
            } else if (err.status === 404) {
              errorMessage = 'La programación no fue encontrada.';
            } else if (err.error?.message) {
              errorMessage = err.error.message;
            }
            
            Swal.fire('Error', errorMessage, 'error');
          }
        });
      }
    });
  }
}