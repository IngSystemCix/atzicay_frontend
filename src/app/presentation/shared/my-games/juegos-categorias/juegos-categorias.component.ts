import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameTypeCountsService } from '../../../../core/infrastructure/api/game-type-counts.service';
import { UserSessionService } from '../../../../core/infrastructure/service/user-session.service';

@Component({
  selector: 'app-juegos-categorias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './juegos-categorias.component.html',
  styleUrl: './juegos-categorias.component.css',
})
export class JuegosCategoriasComponent implements OnInit {
  contadores = {
    Ahorcado: 0,
    Rompecabezas: 0,
    Memoria: 0,
    Pupiletras: 0,
  };

  cargando = true;
  error = false;

  categorias = [
    {
      nombre: 'Ahorcado',
      icono: '🎯',
      cantidad: 0,
      colorFondo: '#F4E8FE',
      borde: '#A294F8',
      hover: 'hover:bg-[#EADDFD]',
      ruta: 'juegos/hangman',
    },
    {
      nombre: 'Rompecabezas',
      icono: '🧩',
      cantidad: 0,
      colorFondo: '#DBEAFF',
      borde: '#A294F8',
      hover: 'hover:bg-[#CFE1FF]',
      ruta: 'juegos/puzzle/create',
    },
    {
      nombre: 'Memoria',
      icono: '🧠',
      cantidad: 0,
      colorFondo: '#DCFCE7',
      borde: '#A294F8',
      hover: 'hover:bg-[#CFFAD9]',
      ruta: 'juegos/memory/create',
    },
    {
      nombre: 'Pupiletras',
      icono: '📝',
      cantidad: 0,
      colorFondo: '#FEF9C2',
      borde: '#A294F8',
      hover: 'hover:bg-[#FDF5A8]',
      ruta: 'juegos/solve-The-Word/create',
    },
  ];

  constructor(
    private router: Router,
    private gameTypeCountsService: GameTypeCountsService,
    private userSession: UserSessionService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadGameTypeCounts();
  }

  private loadGameTypeCounts(): void {
    // Usar el UserSessionService optimizado
    if (this.userSession.isAuthenticated()) {
      const userId = this.userSession.getUserId();
      if (userId) {
        this.fetchGameCounts(userId);
      } else {
        this.handleNoUserId();
      }
    } else {
      this.cargando = true;
      this.userSession.waitForToken$(5000).subscribe({
        next: () => {
          const userId = this.userSession.getUserId();
          if (userId) {
            this.fetchGameCounts(userId);
          } else {
            this.handleNoUserId();
          }
        },
        error: (err: any) => {
          console.error('[JuegosCategorias] Error esperando token:', err);
          this.handleNoUserId();
        }
      });
    }
  }

  private fetchGameCounts(userId: number): void {
    this.cargando = true;
    this.error = false;
    
    this.gameTypeCountsService.getGameTypeCountsByUser(userId).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.updateCounters(res.data);
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al obtener conteos de juegos por tipo:', err);
        this.error = true;
        this.cargando = false;
      },
    });
  }

  private handleNoUserId(): void {
    this.error = true;
    this.cargando = false;
  }

  private updateCounters(data: any): void {
    // Actualiza también los contadores para pruebas y lógica futura
    this.contadores = {
      Ahorcado: data.hangman_count,
      Rompecabezas: data.puzzle_count,
      Memoria: data.memorygame_count,
      Pupiletras: data.solvetheword_count,
    };
    
    this.categorias = this.categorias.map((categoria) => {
      switch (categoria.nombre) {
        case 'Ahorcado':
          return { ...categoria, cantidad: data.hangman_count };
        case 'Rompecabezas':
          return { ...categoria, cantidad: data.puzzle_count };
        case 'Memoria':
          return { ...categoria, cantidad: data.memorygame_count };
        case 'Pupiletras':
          return { ...categoria, cantidad: data.solvetheword_count };
        default:
          return categoria;
      }
    });
  }

  private loadData(): void {
    // TODO: Desactivado temporalmente. Solo se usará dashboard y login.
    // const userString = sessionStorage.getItem('user');
    // if (!userString) {
    //   console.error('No hay usuario en sesión');
    //   this.error = true;
    //   this.cargando = false;
    //   return;
    // }
    //
    // const user = JSON.parse(userString);
    // const email = user?.Email;
    // if (!email) {
    //   console.error('El usuario no tiene email registrado');
    //   this.error = true;
    //   this.cargando = false;
    //   return;
    // }
    //
    // this.cargando = true;
    // this.error = false;
    //
    // this.userService.findUserByEmail(email).pipe(
    //   switchMap((response) => {
    //     const professorId = response?.data?.Id;
    //     if (!professorId) {
    //       throw new Error('ID de usuario no válido');
    //     }
    //     return this.gameInstanceService.getGameCountsByProfessor(professorId);
    //   }),
    //   tap((counts: GameCounts) => {
    //     this.contadores = {
    //       Ahorcado: counts.hangman,
    //       Rompecabezas: counts.puzzle,
    //       Memoria: counts.memory,
    //       Pupiletras: counts.solve_the_word
    //     };
    //
    //     this.categorias = this.categorias.map((categoria) => {
    //       switch (categoria.nombre) {
    //         case 'Ahorcado': return { ...categoria, cantidad: counts.hangman };
    //         case 'Rompecabezas': return { ...categoria, cantidad: counts.puzzle };
    //         case 'Memoria': return { ...categoria, cantidad: counts.memory };
    //         case 'Pupiletras': return { ...categoria, cantidad: counts.solve_the_word };
    //         default: return categoria;
    //       }
    //     });
    //
    //     console.log('Conteos actualizados:', this.contadores);
    //   }),
    //   tap(() => { this.cargando = false }),
    //   catchError((err) => {
    //     console.error('Error al cargar datos:', err);
    //     this.error = true;
    //     this.cargando = false;
    //     return EMPTY;
    //   })
    // ).subscribe();
  }

  crearJuego(ruta: string): void {
    if (ruta) {
      this.router.navigate([ruta]);
    } else {
      console.error('Ruta no definida para este juego');
    }
  }

  recargarDatos(): void {
    this.loadData();
  }

  probarContador(): void {
    this.categorias[0].cantidad = Math.floor(Math.random() * 10) + 1;
    this.contadores.Ahorcado = this.categorias[0].cantidad;
    console.log('Contador de prueba actualizado:', this.categorias[0].cantidad);
  }

  minimizado = true;

  // Agregar este método
  toggleMinimizado(): void {
    this.minimizado = !this.minimizado;
  }
}
