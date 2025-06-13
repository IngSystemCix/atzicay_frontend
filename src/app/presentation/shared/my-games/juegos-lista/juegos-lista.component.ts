import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameInstance } from '../../../../core/domain/model/gameInstance/game-instance';
import { HangmanService } from '../../../../core/infrastructure/api/Hangman/hangman.service';
import { GameInstanceService } from '../../../../core/infrastructure/api/GameInstance/game-instance.service';
import { UserService } from '../../../../core/infrastructure/api/user.service';
import { GameConfiguration } from '../../../../core/infrastructure/api/GameSetting/game-configuration.service';
import { catchError, switchMap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { GameConfigurationComponent } from '../../game-configuration/game-configuration.component';
import { RouterLink } from '@angular/router';
import { ConfigGameComponent } from '../../../features/config-game/config-game.component';
type Dificultad = 'basico' | 'intermedio' | 'dificil';
interface Juego {
  id: number;
  tipo: string;
  icono: string;
  titulo: string;
  vecesJugado: number;
  puntuacion: number;
  estado: 'Activo' | 'Desactivado';
  dificultad: Dificultad;
  gameInstanceId?: number;
  descripcion?: string;
  profesorId?: number;
  visibilidad?: string;
}
@Component({
  selector: 'app-juegos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './juegos-lista.component.html',
  styleUrl: './juegos-lista.component.css',
})
export class JuegosListaComponent implements OnInit {

  filtroSeleccionado: string = 'all';
  filtros: string[] = ['all', 'hangman', 'memory', 'puzzle', 'solve_the_word'];
  filtroLabels: { [key: string]: string } = {
    'all': 'Todos',
    'hangman': 'Ahorcado',
    'memory': 'Memoria',
    'puzzle': 'Rompecabezas',
    'solve_the_word': 'Pupiletras'
  };

  @Output() filtroChange = new EventEmitter<string>();

  filtrar(tipo: string) {
    this.filtroSeleccionado = tipo;
    console.log(`Filtrando por: ${tipo}`);
    this.cargarJuegos();
    this.filtroChange.emit(tipo);
  }

  @Input() filtroActual: string = 'Ahorcado';

  menuAbierto: number | null = null;
  juegos: Juego[] = [];
  cargando: boolean = true;
  error: string | null = null;
  gameInstances: Map<number, GameInstance> = new Map();

  // Variables para el modal de configuración
  showConfigModal = false;
  selectedGameId: number | null = null;

  constructor(
    private hangmanService: HangmanService,
    private gameInstanceService: GameInstanceService,
    private usuarioService: UserService
  ) { }

  ngOnInit(): void {
    this.cargarJuegos();
  }

  cargarJuegos(): void {
    this.cargando = true;
    this.error = null;
    this.juegos = [];

    try {
      const userString = sessionStorage.getItem('user');
      if (!userString) {
        throw new Error('No hay usuario en sesión');
      }

      const user = JSON.parse(userString);
      const email = user?.Email;

      if (!email) {
        throw new Error('El usuario no tiene email registrado');
      }

      this.usuarioService.findUserByEmail(email).pipe(
        switchMap(({ data }) => {
          const userId = data?.Id;
          if (!userId) {
            return throwError(() => new Error('ID de usuario no válido'));
          }

          return this.gameInstanceService.getAllGameInstances(userId, this.filtroSeleccionado).pipe(
            catchError(error =>
              error.status === 404 ? of([]) : throwError(() => error)
            )
          );
        })
      ).subscribe({
        next: juegosData => this.procesarJuegos(juegosData),
        error: err => {
          console.error('Error en la carga de juegos:', err);
          this.error = err.message || 'Error al cargar los juegos';
          this.cargando = false;
        }
      });

    } catch (error) {
      console.error('Error inicial:', error);
      this.error = error instanceof Error ? error.message : 'Error desconocido';
      this.cargando = false;
    }
  }

  private procesarJuegos(juegosData: any[]): void {
    this.juegos = [];

    if (!Array.isArray(juegosData)) {
      console.error('Datos de juegos no es un array:', juegosData);
      juegosData = [];
    }

    const juegosUnicos = new Map<string, Juego>();

    for (const juego of juegosData) {
      if (!juego?.Name) {
        console.warn('Juego sin nombre:', juego);
        continue;
      }

      const nombreKey = juego.Name.trim().toLowerCase();
      if (juegosUnicos.has(nombreKey)) continue;

      juegosUnicos.set(nombreKey, {
        id: juego.Id ?? '',
        tipo: this.mapearTipoJuego(this.filtroSeleccionado),
        icono: this.obtenerIconoJuego(this.filtroSeleccionado),
        titulo: juego.Name,
        descripcion: juego.Description ?? '',
        profesorId: juego.ProfessorId ?? '',
        dificultad: this.convertirDificultad(juego.Difficulty),
        visibilidad: juego.Visibility ?? 'privado',
        estado: juego.Activated ? 'Activo' : 'Desactivado',
        vecesJugado: 0,
        puntuacion: 0,
      });
    }

    this.juegos = Array.from(juegosUnicos.values());

    if (this.juegos.length === 0) {
      this.error = `No tienes juegos de tipo ${this.filtroLabels[this.filtroSeleccionado]} disponibles`;
    }

    this.cargando = false;
  }


  private mapearTipoJuego(gameType: string): string {
    const tipoMap: { [key: string]: string } = {
      'hangman': 'Ahorcado',
      'memory': 'Memoria',
      'puzzle': 'Rompecabezas',
      'solve_the_word': 'Pupiletras',
      'all': 'Mixto'
    };
    return tipoMap[gameType] || 'Desconocido';
  }
  private obtenerIconoJuego(gameType: string): string {
    const iconoMap: { [key: string]: string } = {
      'hangman': '🎯',
      'memory': '🧠',
      'puzzle': '🧩',
      'solve_the_word': '🔤',
      'all': '🎮'
    };
    return iconoMap[gameType] || '🎮';
  }

  get juegosFiltrados(): Juego[] {
    return this.juegos;
  }

  toggleMenu(id: number) {
    this.menuAbierto = this.menuAbierto === id ? null : id;
  }

  pprogramarJuego(id: number) {
    console.log(`Programar juego ${id}`);
    this.selectedGameId = id;
    this.showConfigModal = true;
    this.menuAbierto = null;

    // Cerrar el menú al hacer clic fuera
    document.addEventListener('click', this.cerrarMenus.bind(this));
  }


  eliminarJuego(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este juego? Esta acción no se puede deshacer.')) {
      console.log(`Eliminar juego ${id}`);
      this.hangmanService.deleteHangman(id).subscribe({
        next: () => {
          this.juegos = this.juegos.filter((juego) => juego.id !== id);
          console.log('Juego eliminado con éxito');
          // Mostrar mensaje de éxito
          this.mostrarMensaje('Juego eliminado correctamente', 'success');
        },
        error: (err) => {
          console.error('Error al eliminar el juego', err);
          this.mostrarMensaje('Error al eliminar el juego', 'error');
        },
      });
    }
    this.menuAbierto = null;
  }

  editarJuego(id: number) {
    console.log(`Editar juego ${id}`);
    this.menuAbierto = null;
  }

  cerrarModalConfiguracion() {
    this.showConfigModal = false;
    this.selectedGameId = null;

    // Remover el event listener
    document.removeEventListener('click', this.cerrarMenus.bind(this));
  }

  onConfigurationSaved() {
    console.log('Configuración guardada');

    // Mostrar mensaje de éxito
    this.mostrarMensaje('Configuración guardada correctamente', 'success');

    // Actualizar la lista de juegos
    this.cargarJuegos();

    // Cerrar el modal
    this.cerrarModalConfiguracion();
  }

  // Método auxiliar para cerrar menús
  private cerrarMenus() {
    this.menuAbierto = null;
  }

  // Método auxiliar para mostrar mensajes
  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error') {
    // Aquí puedes implementar un sistema de notificaciones
    // Por ahora, solo usamos alert o console.log
    if (tipo === 'success') {
      console.log('✅ ' + mensaje);
      // alert('✅ ' + mensaje);
    } else {
      console.error('❌ ' + mensaje);
      // alert('❌ ' + mensaje);
    }
  }

  private convertirDificultad(valor: string): Dificultad {
    switch (valor) {
      case 'E':
        return 'basico';
      case 'M':
        return 'intermedio';
      case 'H':
        return 'dificil';
      default:
        return 'intermedio';
    }
  }
}
