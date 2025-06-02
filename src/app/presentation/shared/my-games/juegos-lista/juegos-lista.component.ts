import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameInstance } from '../../../../core/domain/model/gameInstance/game-instance';
import { HangmanService } from '../../../../core/infrastructure/api/Hangman/hangman.service';
import { GameInstanceService } from '../../../../core/infrastructure/api/GameInstance/game-instance.service';
import { UserService } from '../../../../core/infrastructure/api/user.service';
import { catchError, switchMap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
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
  imports: [CommonModule],
  templateUrl: './juegos-lista.component.html',
  styleUrl: './juegos-lista.component.css',
})
export class JuegosListaComponent implements OnInit {
  @Input() filtroActual: string = 'Ahorcado';

  menuAbierto: number | null = null;
  juegos: Juego[] = [];
  cargando: boolean = true;
  error: string | null = null;
  gameInstances: Map<number, GameInstance> = new Map();

  constructor(
    private hangmanService: HangmanService,
    private gameInstanceService: GameInstanceService,
    private usuarioService: UserService
  ) {}

  ngOnInit(): void {
    this.cargarJuegos();
  }

  cargarJuegos(): void {
    this.cargando = true;
    this.error = null;
    this.juegos = []; // Limpiar lista antes de cargar

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
            switchMap(response => {
                if (!response.data?.Id) {
                    throw new Error('ID de usuario no válido');
                }
                
                return this.gameInstanceService.getAllGameInstances(response.data.Id).pipe(
                    catchError(error => {
                        // Si es 404, significa que no hay juegos (no es realmente un error)
                        if (error.status === 404) {
                            return of([]); // Devuelve array vacío
                        }
                        // Para otros errores, los propagamos
                        return throwError(() => error);
                    })
                );
            })
            ).subscribe({
                next: (juegosData: any[]) => {
                    if (!Array.isArray(juegosData)) {
                        console.error('Datos de juegos no es un array:', juegosData);
                        juegosData = [];
                    }

                    const juegosUnicos = new Map<string, Juego>();
                    
                    juegosData.forEach(juego => {
                        try {
                            if (!juego?.Name) {
                                console.warn('Juego sin nombre:', juego);
                                return;
                            }
                            
                            const nombreNormalizado = juego.Name.trim().toLowerCase();
                            if (!juegosUnicos.has(nombreNormalizado)) {
                                juegosUnicos.set(nombreNormalizado, {
                                    id: juego.Id || '',
                                    tipo: 'Otro',
                                    icono: '🎮',
                                    titulo: juego.Name || 'Sin nombre',
                                    descripcion: juego.Description || '',
                                    profesorId: juego.ProfessorId || '',
                                    dificultad: this.convertirDificultad(juego.Difficulty),
                                    visibilidad: juego.Visibility || 'privado',
                                    estado: juego.Activated ? 'Activo' : 'Desactivado',
                                    vecesJugado: 0,
                                    puntuacion: 0,
                                });
                            }
                        } catch (e) {
                            console.error('Error procesando juego:', juego, e);
                        }
                    });

                    this.juegos = Array.from(juegosUnicos.values());
                    
                    if (this.juegos.length === 0) {
                        this.error = 'No tienes juegos disponibles actualmente';
                    }
                    
                    this.cargando = false;
                },
                error: (err) => {
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

  get juegosFiltrados(): Juego[] {
    if (this.filtroActual === 'Todos') {
      return this.juegos;
    }
    return this.juegos.filter((j) => j.tipo === this.filtroActual);
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
        this.juegos = this.juegos.filter((juego) => juego.id !== id);
        console.log('Juego eliminado con éxito');
      },
      error: (err) => {
        console.error('Error al eliminar el juego', err);
      },
    });
    this.menuAbierto = null;
  }

  editarJuego(id: number) {
    console.log(`Editar juego ${id}`);
    this.menuAbierto = null;
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
