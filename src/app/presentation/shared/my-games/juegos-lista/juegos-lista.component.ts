import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MyGamesService } from '../../../../core/infrastructure/api/my-games.service';
import { UserSessionService } from '../../../../core/infrastructure/service/user-session.service';
import { MyGame } from '../../../../core/domain/model/my-game.model';

@Component({
  selector: 'app-juegos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './juegos-lista.component.html',
  styleUrl: './juegos-lista.component.css',
})
export class JuegosListaComponent implements OnInit {
  filtroSeleccionado: string = 'all';
  filtros: string[] = ['all', 'hangman', 'memory', 'puzzle', 'solve_the_word'];
  filtroLabels: { [key: string]: string } = {
    all: 'Todos',
    hangman: 'Ahorcado',
    memory: 'Memoria',
    puzzle: 'Rompecabezas',
    solve_the_word: 'Pupiletras',
  };

  @Output() filtroChange = new EventEmitter<string>();

  filtrar(tipo: string) {
    this.filtroSeleccionado = tipo;
    this.currentOffset = 0;
    this.cargarJuegos();
    this.filtroChange.emit(tipo);
  }

  @Input() filtroActual: string = 'Ahorcado';

  menuAbierto: number | null = null;
  juegos: MyGame[] = [];
  cargando: boolean = true;
  error: string | null = null;
  totalJuegos: number = 0;
  pageLimit: number = 6;
  hasMore: boolean = true;
  private userId: number | null = null;
  currentOffset: number = 0;

  // Variables para el modal de configuración
  showConfigModal = false;
  selectedGameId: number | null = null;

  constructor(
    private myGamesService: MyGamesService,
    private userSession: UserSessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.userSession.getUserId();
    this.cargarJuegos();
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
    this.myGamesService.getMyGames(this.userId, this.filtroSeleccionado, limit, offset).subscribe({
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
    this.selectedGameId = id;
    this.showConfigModal = true;
    this.menuAbierto = null;
    document.addEventListener('click', this.cerrarMenus.bind(this));
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
      case 'R': return 'bg-yellow-500 text-white';
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
