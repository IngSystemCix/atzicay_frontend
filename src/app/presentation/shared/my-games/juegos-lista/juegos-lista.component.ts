import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MyGamesService } from '../../../../core/infrastructure/api/my-games.service';
import { UserSessionService } from '../../../../core/infrastructure/service/user-session.service';
import { MyGame } from '../../../../core/domain/model/my-game.model';
import { UpdateVisibilityService } from '../../../../core/infrastructure/api/update-visibility.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-juegos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(
    private myGamesService: MyGamesService,
    private userSession: UserSessionService,
    private router: Router,
    private updateVisibilityService: UpdateVisibilityService
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
      this.cargarJuegos(true);
    }
  }

  get juegosFiltrados(): MyGame[] {
    return this.juegos;
  }

  toggleMenu(id: number) {
    this.menuAbierto = this.menuAbierto === id ? null : id;
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
  }

  cerrarModalConfiguracion() {
    this.showConfigModal = false;
    this.selectedGameId = null;
    document.removeEventListener('click', this.cerrarMenus.bind(this));
  }

  onConfigurationSaved() {
    this.mostrarMensaje('Configuración guardada correctamente', 'success');
    this.cargarJuegos();
    this.cerrarModalConfiguracion();
  }

  changeVisibility(juego: MyGame) {
    const isPublic = juego.visibility === 'P';
    // Para el endpoint: true = público, false = restringido
    const newStatus = !isPublic; // Si era público (P), será false (restringido), si era restringido (R), será true (público)
    const confirmText = isPublic ? '¿Deseas hacer este juego restringido?' : '¿Deseas hacer este juego público?';
    const successText = isPublic ? 'El juego ahora es restringido.' : 'El juego ahora es público.';
    const confirmButton = isPublic ? 'Sí, restringir' : 'Sí, hacer público';
    
    console.log('Estado actual del juego:', {
      gameId: juego.game_instance_id,
      currentVisibility: juego.visibility,
      isCurrentlyPublic: isPublic,
      willBePublic: newStatus
    });
    
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
        console.log('Enviando request:', { 
          gameInstanceId: juego.game_instance_id, 
          status: newStatus,
          explanation: `Cambiando de ${isPublic ? 'público' : 'restringido'} a ${newStatus ? 'público' : 'restringido'}`
        });
        
        // Función de depuración
        this.updateVisibilityService.testUpdateVisibility(juego.game_instance_id, newStatus);
        
        this.updateVisibilityService.updateVisibility(juego.game_instance_id, newStatus).subscribe({
          next: (response) => {
            console.log('✅ Respuesta exitosa del servidor:', response);
            console.log('📦 Data recibida:', response.data);
            
            if (response.data) {
              console.log('🎯 Nuevo status recibido:', response.data.status);
              console.log('👁️ Nueva visibilidad recibida:', response.data.visibility);
            }
            
            this.menuAbierto = null;
            
            // Actualizar localmente el estado del juego usando la respuesta del servidor
            if (response.data && response.data.visibility) {
              juego.visibility = response.data.visibility;
            } else {
              // Fallback en caso de que el backend aún no esté actualizado
              juego.visibility = newStatus ? 'P' : 'R';
            }
            
            // Mostrar mensaje de éxito
            Swal.fire('Actualizado', successText, 'success');
            
            // Opcional: recargar la lista para asegurar consistencia
            // this.cargarJuegos();
          },
          error: (err) => {
            this.menuAbierto = null;
            console.error('❌ Error completo al cambiar visibilidad:', {
              error: err,
              gameId: juego.game_instance_id,
              attemptedStatus: newStatus,
              currentVisibility: juego.visibility,
              errorMessage: err.error?.message || err.message,
              statusCode: err.status,
              url: err.url,
              headers: err.headers,
              fullError: err
            });
            
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
    switch (v) {
      case 'P': return 'bg-blue-500 text-white';
      case 'R': return 'bg-orange-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
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