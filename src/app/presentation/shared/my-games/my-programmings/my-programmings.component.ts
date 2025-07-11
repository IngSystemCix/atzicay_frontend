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
import { GameUrlService } from '../../../../core/infrastructure/service/game-url.service';
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
  categoryDropdownOpen = false;
  dateDropdownOpen = false;
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
  generatingUrlForActivity: number | null = null; // Para mostrar estado de carga
  isLoadingMore: boolean = false; // Para mostrar estado de carga del botón "Ver más"
  private subscription = new Subscription();
  constructor(
    private myProgrammingGamesService: MyProgrammingGamesService,
    private route: ActivatedRoute,
    private router: Router,
    private userSession: UserSessionService,
    private programmingStatusService: ProgrammingStatusService,
    private gameUrlService: GameUrlService
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
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  private initializeComponent(): void {
    // Verificar si ya tenemos userId y token
    this.userId = this.userSession.getUserId() || 0;

    if (this.userId && this.userSession.isAuthenticated()) {
      this.loadProgrammings();
    } else {
      // Esperar tanto el token como el userId
      this.subscription.add(
        this.userSession.waitForToken$(5000).subscribe({
          next: (token) => {
            this.waitForUserId();
          },
          error: (err) => {
            console.error('[MyProgrammings] Error esperando token:', err);
          },
        })
      );
    }
  }

  private waitForUserId(): void {
    this.subscription.add(
      this.userSession.userId$.subscribe((userId) => {
        if (userId) {
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
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  onScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  ngOnChanges() {
    this.resetPagination();
    this.loadProgrammings();
  }

  loadProgrammings(loadMore: boolean = false): void {
    // Usar el mapeo correcto para todos los tipos de juego
    const gameType = this.mapTabToType(this.selectedTab);

    const limit = loadMore
      ? this.currentPage * this.activitiesPerPage
      : this.activitiesPerPage;
    const offset = 0;

    if (loadMore) {
      this.isLoadingMore = true;
    }

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
            // Con la nueva lógica, siempre reemplazamos todas las actividades
            this.activities = res.data.data;
            this.totalActivities = res.data.total;
          } else {
            this.activities = [];
            console.warn(
              '⚠️ [MyProgrammings] Respuesta inválida del backend:',
              res
            );
          }

          // Ocultar loading
          this.isLoadingMore = false;
        },
        error: (err) => {
          this.activities = [];
          console.error(
            '❌ [MyProgrammings] Error al cargar programaciones:',
            err
          );
          this.isLoadingMore = false;
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
    // Incrementar la página para cargar más elementos
    this.currentPage++;

    // Cargar con más elementos (el limit se calculará como currentPage * activitiesPerPage)
    this.loadProgrammings(true);
  }

  resetPagination(): void {
    this.currentPage = 1;
    this.activities = [];
    this.isLoadingMore = false;
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
  }

  showOptions(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.menuAbierto = this.menuAbierto === id ? null : id;
  }

  closeMenus(): void {
    this.menuAbierto = null;
  }
  verReporte(id: number): void {
    this.menuAbierto = null;

    // Navegar al nuevo componente de reporte
    this.router.navigate(['/juegos/reporte', id]);
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
    const confirmText = isActive
      ? '¿Deseas hacer esta programación restringida?'
      : '¿Deseas hacer esta programación pública?';
    const successText = isActive
      ? 'La programación ahora es restringida.'
      : 'La programación ahora es pública.';
    const confirmButton = isActive ? 'Sí, restringir' : 'Sí, hacer pública';

    Swal.fire({
      title: 'Cambiar estado',
      text: confirmText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8571FB',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButton,
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.programmingStatusService
          .setProgrammingGameStatus(activity.game_instance_id, newStatus)
          .subscribe({
            next: (response) => {
              this.menuAbierto = null;
              if (response.data && typeof response.data.status === 'number') {
                activity.status = response.data.status;
              } else {
                activity.status = newStatus;
              }
              Swal.fire('Actualizado', successText, 'success');
            },
            error: (err) => {
              this.menuAbierto = null;
              let errorMessage =
                'No se pudo cambiar el estado de la programación.';
              if (err.status === 401) {
                errorMessage =
                  'No tienes autorización para realizar esta acción.';
              } else if (err.status === 404) {
                errorMessage = 'La programación no fue encontrada.';
              } else if (err.error?.message) {
                errorMessage = err.error.message;
              }

              Swal.fire('Error', errorMessage, 'error');
            },
          });
      }
    });
  }

  generateGameUrl(activity: MyProgrammingGame): void {
    // Evitar múltiples llamadas simultáneas para la misma actividad
    if (this.generatingUrlForActivity === activity.game_instance_id) {
      return;
    }

    // Mapear el tipo de juego a la ruta correspondiente
    const gameRoute = this.gameUrlService.mapGameTypeToRoute(
      activity.type_game
    );

    if (gameRoute === 'unknown') {
      console.error('❌ Tipo de juego no reconocido:', {
        received: activity.type_game,
        availableTypes: ['hangman', 'puzzle', 'memory', 'solve-the-word'],
      });
      Swal.fire(
        'Error',
        `Tipo de juego no reconocido: "${activity.type_game}"`,
        'error'
      );
      return;
    }

    // Marcar como generando URL
    this.generatingUrlForActivity = activity.game_instance_id;

    // Mostrar loading mientras se genera el token
    Swal.fire({
      title: 'Generando URL Segura...',
      text: 'Por favor espera mientras generamos tu enlace de juego',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Generar token seguro
    this.gameUrlService
      .generateSecureGameToken(activity.game_instance_id, this.userId)
      .subscribe({
        next: (response) => {
          // Limpiar estado de carga
          this.generatingUrlForActivity = null;

          if (response.success) {
            // Generar URL limpia con el token
            const secureUrl = this.gameUrlService.generateCleanGameUrl(
              gameRoute,
              response.data.token
            );

            // Mapear el tipo de juego a español
            const typeGameSpanish = this.getTypeGameSpanish(activity.type_game);
            // Cerrar loading y mostrar URL
            Swal.close();
            Swal.fire({
              title: '🔒 URL Segura Generada',
              html: `
                <div class="text-left">
                  <div class="mb-4 p-4 rounded-lg" style="background: var(--color-atzicay-purple-50);">
                    <div class="mb-2 text-sm font-semibold" style="color: var(--color-atzicay-purple-700);">Juego</div>
                    <div class="mb-2 text-base font-bold" style="color: var(--color-atzicay-heading);">${activity.name_game}</div>
                    <div class="mb-2 text-sm font-semibold" style="color: var(--color-atzicay-purple-700);">Programación</div>
                    <div class="mb-2 text-base font-bold" style="color: var(--color-atzicay-heading);">${activity.programming_name}</div>
                    <div class="mb-2 text-sm font-semibold" style="color: var(--color-atzicay-purple-700);">Tipo</div>
                    <div class="mb-2 text-base font-bold" style="color: var(--color-atzicay-heading);">${typeGameSpanish}</div>
                  </div>
                  <div class="p-3 rounded-lg border mb-4" style="background: var(--color-atzicay-bg); border-color: var(--color-atzicay-border);">
                    <p class="text-sm font-medium mb-2" style="color: var(--color-atzicay-heading);">URL del juego:</p>
                    <input id="gameUrlInput" type="text" value="${secureUrl}" 
                           class="w-full p-2 text-xs border rounded bg-white mb-2" readonly style="border-color: var(--color-atzicay-input-border); background: var(--color-atzicay-input-bg); color: var(--color-atzicay-text-color);">
                  </div>
                  <p class="text-xs mt-2 mb-4" style="color: var(--color-atzicay-dropdown-text);">
                    Esta URL incluye el contexto de la programación y permitirá al estudiante jugar con todos los intentos y configuraciones establecidas.
                  </p>
                  <div id="swal-footer" class="flex flex-row justify-center gap-6 mt-8">
                    <input id="playNowBtn" type="button" value="🎮 Jugar Ahora" class="px-5 py-2 text-base font-semibold rounded-lg cursor-pointer shadow" style="background: #22c55e; color: #fff;" />
                    <input id="copyUrlBtn" type="button" value="📋 Copiar URL" class="px-5 py-2 text-base font-semibold rounded-lg cursor-pointer shadow" style="background: var(--color-atzicay-purple-500); color: var(--color-atzicay-text-light);" />
                  </div>
                </div>
              `,
              showConfirmButton: false,
              showCancelButton: false,
              showCloseButton: true,
              allowOutsideClick: true,
              customClass: {
                popup: 'text-left',
                loader: 'swal2-hide-loader',
              },
              didOpen: () => {
                const loader = document.querySelector('.swal2-loader');
                if (loader) {
                  (loader as HTMLElement).style.display = 'none';
                }
                const copyBtn = document.getElementById(
                  'copyUrlBtn'
                ) as HTMLInputElement;
                const playBtn = document.getElementById(
                  'playNowBtn'
                ) as HTMLInputElement;
                const input = document.getElementById(
                  'gameUrlInput'
                ) as HTMLInputElement;
                if (copyBtn && input) {
                  copyBtn.addEventListener('click', () => {
                    input.select();
                    navigator.clipboard
                      .writeText(input.value)
                      .then(() => {
                        Swal.fire({
                          title: '¡Copiado!',
                          text: 'La URL segura ha sido copiada al portapapeles',
                          icon: 'success',
                          timer: 2000,
                          showConfirmButton: false,
                        });
                      })
                      .catch(() => {
                        document.execCommand('copy');
                        Swal.fire({
                          title: '¡Copiado!',
                          text: 'La URL segura ha sido copiada al portapapeles',
                          icon: 'success',
                          timer: 2000,
                          showConfirmButton: false,
                        });
                      });
                  });
                }
                if (playBtn && input) {
                  playBtn.addEventListener('click', () => {
                    window.open(input.value, '_blank');
                  });
                }
              },
            });
          } else {
            Swal.fire(
              'Error',
              response.message || 'No se pudo generar la URL del juego',
              'error'
            );
          }
        },
        error: (error) => {
          // Limpiar estado de carga
          this.generatingUrlForActivity = null;

          console.error('Error generando token de acceso:', error);
          Swal.fire(
            'Error',
            'No se pudo generar la URL del juego. Por favor intenta nuevamente.',
            'error'
          );
        },
      });
  }
  /**
   * Devuelve el nombre en español del tipo de juego
   */
  getTypeGameSpanish(type: string): string {
    switch (type) {
      case 'hangman':
        return 'Ahorcado';
      case 'puzzle':
        return 'Rompecabezas';
      case 'memory':
        return 'Memoria';
      case 'solve_the_word':
      case 'solve-the-word':
        return 'Pupiletras';
      default:
        return type;
    }
  }

  // Métodos para los nuevos dropdowns
  toggleCategoryDropdown() {
    this.categoryDropdownOpen = !this.categoryDropdownOpen;
    if (this.categoryDropdownOpen) {
      this.dateDropdownOpen = false;
    }
  }

  toggleDateDropdown() {
    this.dateDropdownOpen = !this.dateDropdownOpen;
    if (this.dateDropdownOpen) {
      this.categoryDropdownOpen = false;
    }
  }

  selectCategory(category: string) {
    this.selectedTab = category;
    this.categoryDropdownOpen = false;
    this.resetPagination();
    this.loadProgrammings();
  }

  getDateFilterLabel(): string {
    if (this.startDate && this.endDate) {
      return `${this.formatDateShort(this.startDate)} - ${this.formatDateShort(
        this.endDate
      )}`;
    } else if (this.startDate) {
      return `Desde ${this.formatDateShort(this.startDate)}`;
    } else if (this.endDate) {
      return `Hasta ${this.formatDateShort(this.endDate)}`;
    }
    return 'Filtrar por fecha';
  }

  private formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  }

  clearDates() {
    this.startDate = '';
    this.endDate = '';
    this.onDateChange();
  }

  applyDateFilter() {
    this.dateDropdownOpen = false;
    this.onDateChange();
  }

  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.categoryDropdownOpen = false;
      this.dateDropdownOpen = false;
    }
  }
}
