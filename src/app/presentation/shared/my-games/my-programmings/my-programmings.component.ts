import { Component, OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MyProgrammingGamesService } from '../../../../core/infrastructure/api/my-programming-games.service';
import { MyProgrammingGame } from '../../../../core/domain/model/my-programming-game.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UserSessionService } from '../../../../core/infrastructure/service/user-session.service';
import { DisableProgrammingGameService } from '../../../../core/infrastructure/api/disable-programming-game.service';
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
export class MyProgrammingsComponent implements OnChanges {
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
  constructor(
    private myProgrammingGamesService: MyProgrammingGamesService,
    private route: ActivatedRoute,
    private router: Router,
    private userSession: UserSessionService,
    private disableProgrammingGameService: DisableProgrammingGameService,
    private gameReportService: GameReportService // Corregido: inyectar correctamente el servicio
  ) {}

  ngOnInit() {
    const id = this.userSession.getUserId();
    this.userId = id ? id : 0;
    this.route.queryParams.subscribe((params) => {
      this.gameId = params['gameId'] ? +params['gameId'] : null;
      this.resetPagination();
      this.loadProgrammings();
    });
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  ngOnDestroy() {
    // Remover listener cuando se destruya el componente
    window.removeEventListener('scroll', this.onScroll.bind(this));
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
    console.log('Editar actividad', id);
  }

  showOptions(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.menuAbierto = this.menuAbierto === id ? null : id;
  }

  eliminarActividad(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción desactivará la programación.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8571FB',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.disableProgrammingGameService
          .disableProgrammingGame(id)
          .subscribe({
            next: () => {
              this.menuAbierto = null;
              this.resetPagination();
              this.loadProgrammings();
              Swal.fire(
                'Desactivado',
                'La programación fue desactivada correctamente.',
                'success'
              );
            },
            error: (err) => {
              this.menuAbierto = null;
              Swal.fire(
                'Error',
                'Error al desactivar la programación',
                'error'
              );
              console.error('Error al desactivar:', err);
            },
          });
      }
    });
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
}
