import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, map, mergeMap, Observable, of } from 'rxjs';
import { GameInstance } from '../../../../core/domain/model/gameInstance/game-instance';
import { HangmanService } from '../../../../core/infrastructure/api/Hangman/hangman.service';
import { GameInstanceService } from '../../../../core/infrastructure/api/GameInstance/game-instance.service';

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
  clue?: string; // Pista del juego (opcional)
  word?: string; // Palabra del juego (opcional)
  gameInstanceId?: number; // ID de la instancia del juego
  descripcion?: string; // Descripción del juego
  profesorId?: number; // ID del profesor
  visibilidad?: string; // Visibilidad del juego
}

@Component({
  selector: 'app-juegos-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './juegos-lista.component.html',
  styleUrl: './juegos-lista.component.css'
})
export class JuegosListaComponent implements OnInit {
  @Input() filtroActual: string = 'Ahorcado'; // Por defecto filtramos por Ahorcado

  menuAbierto: number | null = null;
  juegos: Juego[] = [];
  cargando: boolean = true;
  error: string | null = null;
  gameInstances: Map<number, GameInstance> = new Map(); // Para almacenar las instancias de juego por ID

  constructor(
    private hangmanService: HangmanService,
    private gameInstanceService: GameInstanceService // Inyectamos el servicio de GameInstance
  ) { }

  ngOnInit(): void {
    this.cargarJuegos();
  }

  cargarJuegos(): void {
    this.cargando = true;
    this.error = null;
    
    // Primero cargamos todas las instancias de juego
    this.gameInstanceService.getAllGameInstances().subscribe({
      next: (gameInstances) => {
        // Guardamos las instancias en un Map para acceso rápido por ID
        gameInstances.forEach(instance => {
          this.gameInstances.set(instance.Id, instance);
        });
        
        // Después cargamos los juegos de Ahorcado
        this.cargarHangmanJuegos();
      },
      error: (err) => {
        console.error('Error al cargar instancias de juego', err);
        this.error = 'Error al cargar las instancias de juego';
        this.cargando = false;
      }
    });
  }

  cargarHangmanJuegos(): void {
    this.hangmanService.getAllHangman().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          // Transformar los datos del backend al formato de Juego
          this.juegos = response.data.map((hangman: any) => this.mapHangmanToJuego(hangman));
        } else {
          this.error = 'No se pudieron cargar los juegos correctamente';
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar juegos de Ahorcado', err);
        this.error = 'Error al cargar los juegos';
        this.cargando = false;
      }
    });
  }

  // Método para convertir un objeto Hangman en un objeto Juego
  mapHangmanToJuego(hangman: any): Juego {
    // Obtenemos la instancia de juego correspondiente
    const gameInstance = this.gameInstances.get(hangman.GameInstanceId);
    
    // Mapeo de la dificultad del backend a nuestro tipo local
    const mapearDificultad = (dificultadBackend: string): Dificultad => {
      switch(dificultadBackend) {
        case 'E': return 'basico';
        case 'M': return 'intermedio';
        case 'D': return 'dificil';
        default: return 'basico';
      }
    };
    
    // Si tenemos la instancia del juego, usamos sus datos
    const dificultad = gameInstance ? mapearDificultad(gameInstance.Difficulty) : 'basico';
    const estado = gameInstance ? (gameInstance.Activated ? 'Activo' : 'Desactivado') : 'Desactivado';
    const titulo = gameInstance ? gameInstance.Name : `Ahorcado: ${hangman.Word}`;
    
    return {
      id: hangman.Id,
      tipo: 'Ahorcado',
      icono: '🪓', // Icono predeterminado para Ahorcado
      titulo: titulo,
      vecesJugado: Math.floor(Math.random() * 100), // Datos de ejemplo
      puntuacion: +(Math.random() * 5).toFixed(1), // Puntuación aleatoria entre 0 y 5
      estado: estado,
      dificultad: dificultad,
      clue: hangman.Clue,
      word: hangman.Word,
      gameInstanceId: hangman.GameInstanceId,
      descripcion: gameInstance ? gameInstance.Description : '',
      profesorId: gameInstance ? gameInstance.ProfessorId : undefined,
      visibilidad: gameInstance ? gameInstance.Visibility : undefined
    };
  }

  get juegosFiltrados(): Juego[] {
    if (this.filtroActual === 'Todos') {
      return this.juegos;
    }
    return this.juegos.filter(j => j.tipo === this.filtroActual);
  }

  toggleMenu(id: number) {
    this.menuAbierto = this.menuAbierto === id ? null : id;
  }

  programarJuego(id: number) {
    console.log(`Programar juego ${id}`);
    this.menuAbierto = null;
  }

  eliminarJuego(id: number) {
    console.log(`Eliminar juego ${id}`);
    this.hangmanService.deleteHangman(id).subscribe({
      next: () => {
        this.juegos = this.juegos.filter(juego => juego.id !== id);
        console.log('Juego eliminado con éxito');
      },
      error: (err) => {
        console.error('Error al eliminar el juego', err);
      }
    });
    this.menuAbierto = null;
  }

  editarJuego(id: number) {
    console.log(`Editar juego ${id}`);
    this.menuAbierto = null;
  }
}