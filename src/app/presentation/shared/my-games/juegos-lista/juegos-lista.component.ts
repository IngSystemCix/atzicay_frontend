import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MyGamesService } from '../../../../core/infrastructure/api/my-games.service';
import { UserSessionService } from '../../../../core/infrastructure/service/user-session.service';
import { MyGame } from '../../../../core/domain/model/my-game.model';
import { UpdateVisibilityService } from '../../../../core/infrastructure/api/update-visibility.service';
import { GamePrivacyService } from '../../../../core/infrastructure/api/game-privacy.service';
import { EditGameModalComponent } from '../edit-game-modal/edit-game-modal.component';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-juegos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, EditGameModalComponent],
  templateUrl: './juegos-lista.component.html',
  styleUrl: './juegos-lista.component.css',
})
export class JuegosListaComponent implements OnInit, OnChanges, OnDestroy {
  @Input() filtroActual: string = 'all';
  @Output() filtroChange = new EventEmitter<string>();

  menuAbierto: number | null = null;
  juegos: MyGame[] = [];
  cargando: boolean = true;
  error: string | null = null;
  totalJuegos: number = 0;
  pageLimit: number = 6;
  hasMore: boolean = true;
  private userId: number | null = null;
  currentOffset: number = 0;
  private subscription = new Subscription();

  // Variables para el modal de configuración
  showConfigModal = false;
  selectedGameId: number | null = null;

  // Variables para el modal de edición
  showEditModal = false;
  selectedGame: MyGame | null = null;

  constructor(
    private myGamesService: MyGamesService,
    private userSession: UserSessionService,
    private router: Router,
    private updateVisibilityService: UpdateVisibilityService,
    private gamePrivacyService: GamePrivacyService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initializeComponent(): void {
    // Verificar si ya tenemos userId y token
    this.userId = this.userSession.getUserId();
    
    if (this.userId && this.userSession.isAuthenticated()) {
      console.log('[JuegosList] Usuario y token disponibles, cargando juegos...');
      this.cargarJuegos();
    } else {
      console.log('[JuegosList] Esperando token y userId...');
      // Esperar tanto el token como el userId
      this.subscription.add(
        this.userSession.waitForToken$(5000).subscribe({
          next: (token) => {
            console.log('[JuegosList] Token recibido');
            // Ahora verificar userId
            this.waitForUserId();
          },
          error: (err) => {
            console.error('[JuegosList] Error esperando token:', err);
            this.error = 'Error de autenticación. Intente recargar la página.';
            this.cargando = false;
          }
        })
      );
    }
  }

  private waitForUserId(): void {
    // Suscribirse a cambios en userId
    this.subscription.add(
      this.userSession.userId$.subscribe(userId => {
        if (userId) {
          console.log('[JuegosList] UserId recibido:', userId);
          this.userId = userId;
          this.cargarJuegos();
        }
      })
    );

    // Si después de un tiempo no tenemos userId, mostrar error
    setTimeout(() => {
      if (!this.userId) {
        this.error = 'No se pudo obtener la información del usuario.';
        this.cargando = false;
      }
    }, 3000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filtroActual'] && !changes['filtroActual'].firstChange) {
      this.currentOffset = 0;
      this.cargarJuegos();
    }
  }

  cargarJuegos(loadMore: boolean = false): void {
    if (!this.userId) {
      this.error = 'No hay usuario en sesión';
      this.cargando = false;
      return;
    }
    this.cargando = true;
    this.error = null;
    const offset = loadMore ? this.currentOffset : 0;
    const limit = this.pageLimit;
    // Usar filtroActual en vez de filtroSeleccionado
    this.myGamesService.getMyGames(this.userId, this.filtroActual, limit, offset).subscribe({
      next: (res) => {
        if (res && res.data && Array.isArray(res.data.data)) {
          if (loadMore && offset > 0) {
            this.juegos = [...this.juegos, ...res.data.data];
          } else {
            this.juegos = res.data.data;
          }
          this.totalJuegos = res.data.total;
          this.hasMore = this.juegos.length < this.totalJuegos;
          this.currentOffset = this.juegos.length;
        } else {
          this.juegos = [];
          this.hasMore = false;
        }
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los juegos';
        this.cargando = false;
        this.juegos = [];
        this.hasMore = false;
      }
    });
  }

  loadMoreJuegos(): void {
    if (this.hasMore && !this.cargando) {
      // Marcar la posición actual antes de cargar más
      const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      const currentJuegosCount = this.juegos.length;
      
      this.cargarJuegos(true);
      
      // Después de cargar más juegos, hacer scroll suave hacia los nuevos elementos
      setTimeout(() => {
        if (this.juegos.length > currentJuegosCount) {
          // Scroll suave hacia los nuevos elementos
          const newElements = document.querySelectorAll('.juego-card');
          if (newElements.length > currentJuegosCount) {
            const targetElement = newElements[currentJuegosCount];
            if (targetElement) {
              targetElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
            }
          }
        }
      }, 300); // Dar tiempo para que se rendericen los nuevos elementos
    }
  }

  get juegosFiltrados(): MyGame[] {
    return this.juegos;
  }

  toggleMenu(id: number) {
    if (this.menuAbierto === id) {
      this.menuAbierto = null;
      document.removeEventListener('click', this.cerrarMenusBound);
    } else {
      this.menuAbierto = id;
      this.cerrarMenusBound = this.cerrarMenusOutside.bind(this);
      setTimeout(() => {
        document.addEventListener('click', this.cerrarMenusBound);
      }, 0);
    }
  }

  private cerrarMenusBound: any;

  private cerrarMenusOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-menu')) {
      this.menuAbierto = null;
      document.removeEventListener('click', this.cerrarMenusBound);
    }
  }

  verProgramaciones(id: number) {
    this.menuAbierto = null;
    this.router.navigate(['/juegos'], {
      queryParams: { gameId: id },
    });
  }

  programarJuego(id: number) {
    this.menuAbierto = null;
    const juego = this.juegos.find(j => j.game_instance_id === id);
    if (juego) {
      this.router.navigate(['/juegos/configuracion', id], {
        queryParams: {
          name: juego.name,
          type: juego.type_game
        }
      });
    } else {
      this.router.navigate(['/juegos/configuracion', id]);
    }
  }

  eliminarJuego(id: number) {}

  editarJuego(id: number) {
    this.menuAbierto = null;
    const juego = this.juegos.find(j => j.game_instance_id === id);
    if (juego) {
      this.selectedGame = juego;
      this.showEditModal = true;
    }
  }

  cerrarModalConfiguracion() {
    this.showConfigModal = false;
    this.selectedGameId = null;
    document.removeEventListener('click', this.cerrarMenus.bind(this));
  }

  // Nuevos métodos para el modal de edición
  cerrarModalEdicion() {
    this.showEditModal = false;
    this.selectedGame = null;
  }

  onGameEditSaved() {
    this.mostrarMensaje('Juego actualizado correctamente', 'success');
    this.cargarJuegos();
    this.cerrarModalEdicion();
  }

  onConfigurationSaved() {
    this.mostrarMensaje('Configuración guardada correctamente', 'success');
    this.cargarJuegos();
    this.cerrarModalConfiguracion();
  }

  changeVisibility(juego: MyGame) {
    const isPublic = juego.visibility === 'P';
    const newStatus = isPublic ? false : true; // true = público, false = restringido (boolean)
    const confirmText = isPublic ? '¿Deseas hacer este juego restringido?' : '¿Deseas hacer este juego público?';
    const successText = isPublic ? 'El juego ahora es restringido.' : 'El juego ahora es público.';
    const confirmButton = isPublic ? 'Sí, restringir' : 'Sí, hacer público';

    Swal.fire({
      title: 'Cambiar visibilidad',
      text: confirmText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8571FB',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButton,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateVisibilityService.updateVisibility(juego.game_instance_id, newStatus).subscribe({
          next: (response) => {
            this.menuAbierto = null;
            Swal.fire('Actualizado', successText, 'success');
            this.cargarJuegos(); // Recarga la lista desde el backend para reflejar el estado real
          },
          error: (err) => {
            this.menuAbierto = null;
            let errorMessage = 'No se pudo cambiar la visibilidad.';
            if (err.status === 401) {
              errorMessage = 'No tienes autorización para realizar esta acción. Verifica tu sesión.';
            } else if (err.status === 404) {
              errorMessage = 'El juego no fue encontrado.';
            } else if (err.status === 422) {
              errorMessage = 'Datos de solicitud inválidos.';
            } else if (err.status === 0) {
              errorMessage = 'Error de conexión. Verifica que el servidor esté funcionando.';
            } else if (err.error?.message) {
              errorMessage = err.error.message;
            }
            Swal.fire('Error', errorMessage, 'error');
          }
        });
      }
    });
  }

  changePrivacy(juego: MyGame, privacy: 'P' | 'R') {
    const isPublic = privacy === 'P';
    const confirmText = isPublic ? '¿Deseas hacer este juego público?' : '¿Deseas hacer este juego privado?';
    const successText = isPublic ? 'El juego ahora es público.' : 'El juego ahora es privado.';
    const confirmButton = isPublic ? 'Sí, hacer público' : 'Sí, hacer privado';

    Swal.fire({
      title: 'Cambiar privacidad',
      text: confirmText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8571FB',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButton,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.gamePrivacyService.updatePrivacy(juego.game_instance_id, privacy).subscribe({
          next: (response) => {
            this.menuAbierto = null;
            Swal.fire('Actualizado', successText, 'success');
            this.cargarJuegos();
          },
          error: (err) => {
            this.menuAbierto = null;
            let errorMessage = 'No se pudo cambiar la privacidad.';
            if (err.status === 401) {
              errorMessage = 'No tienes autorización para realizar esta acción. Verifica tu sesión.';
            } else if (err.status === 404) {
              errorMessage = 'El juego no fue encontrado.';
            } else if (err.status === 422) {
              errorMessage = 'Datos de solicitud inválidos.';
            } else if (err.status === 0) {
              errorMessage = 'Error de conexión. Verifica que el servidor esté funcionando.';
            } else if (err.error?.message) {
              errorMessage = err.error.message;
            }
            Swal.fire('Error', errorMessage, 'error');
          }
        });
      }
    });
  }

  getRoundedRating(rating: string): number {
    const numRating = parseFloat(rating);
    return isNaN(numRating) ? 0 : Math.round(numRating);
  }
  getIcon(type: string): string {
    const iconoMap: { [key: string]: string } = {
      hangman: '🎯',       
      memory: '🧠',         
      puzzle: '🧩',        
      solve_the_word: '📝', 
      all: '🎮',          
    };
    return iconoMap[type] || '🎮';
  }
  getDifficultyLabel(d: string): string {
    switch (d) {
      case 'E': return 'Fácil';
      case 'M': return 'Intermedio';
      case 'H': return 'Difícil';
      default: return 'Desconocido';
    }
  }
  getVisibilityLabel(v: string): string {
    switch (v) {
      case 'P': return '🌐 Público';
      case 'R': return '🔒 Restringido';
      default: return '❓ No definido';
    }
  }
  getVisibilityClass(v: string): string {
    if (v === 'P') {
      return 'bg-blue-500 text-white';
    } else if (v === 'R') {
      return 'bg-orange-400 text-white';
    }
    return 'bg-gray-400 text-white';
  }

    formatRating(rating: string): string {
    const numRating = parseFloat(rating);
    return isNaN(numRating) ? '0.0' : numRating.toFixed(1);
  }

  getStarsArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  getVisibilityInfo(visibility: string) {
    if (visibility === 'P') {
      return {
        isPublic: true,
        currentLabel: 'Público',
        actionLabel: 'Hacer Restringido',
        actionDescription: 'Cambiar a privado',
        icon: 'lock',
        color: 'yellow'
      };
    } else {
      return {
        isPublic: false,
        currentLabel: 'Restringido',
        actionLabel: 'Hacer Público',
        actionDescription: 'Cambiar a público',
        icon: 'globe',
        color: 'blue'
      };
    }
  }

  getActivated(Activated: number): string {
    return Activated === 1 ? 'Activo' : 'Inactivo';
  }

  private cerrarMenus() {
    this.menuAbierto = null;
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error') {
    if (tipo === 'success') {
      console.log('✅ ' + mensaje);
    } else {
      console.error('❌ ' + mensaje);
    }
  }
}