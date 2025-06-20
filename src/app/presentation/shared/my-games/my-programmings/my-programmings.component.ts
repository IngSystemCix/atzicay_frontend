import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgrammingGameService } from '../../../../core/infrastructure/api/ProgrammingGame/programming-game.service';
import { ProgrammingGame } from '../../../../core/domain/interface/programming-game';
import { ActivatedRoute, Router } from '@angular/router';

interface ActivityCard {
  id: number;
  type: string;
  title: string;
  status: 'Activo' | 'Desactivado';
  difficulty: 'basico' | 'intermedio' | 'dificil';
}

@Component({
  selector: 'app-my-programmings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-programmings.component.html',
  styleUrl: './my-programmings.component.css',
})
export class MyProgrammingsComponent implements OnChanges {
    @Input() gameId: number | null = null;

  activities: ActivityCard[] = [];
  mobileMenuOpen = false;
  private activitiesPerPage = 6;
  private currentPage = 1;
  gameTitle: string = '';
  showingSpecificGame: boolean = false;
  

  constructor(
    private programmingGameService: ProgrammingGameService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnChanges() {
    if (this.gameId) {
      // Filtrar o cargar programaciones específicas del juego
      this.cargarProgramacionesDelJuego(this.gameId);
    }
  }
   private cargarProgramacionesDelJuego(gameId: number) {
    // Lógica para filtrar las programaciones por el gameId
    console.log('Mostrando programaciones del juego:', gameId);
  }

  //Esto es para el diseño responsivo
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  getPaginatedActivities() {
    const filteredActivities = this.getFilteredActivities();
    const startIndex = 0;
    const endIndex = this.currentPage * this.activitiesPerPage;

    return filteredActivities.slice(startIndex, endIndex);
  }

  hasMoreActivities(): boolean {
    const filteredActivities = this.getFilteredActivities();
    const totalShown = this.currentPage * this.activitiesPerPage;

    return filteredActivities.length > totalShown;
  }

  loadMore(): void {
    this.currentPage++;
  }

  /**
   * Resetea la paginación cuando cambian los filtros
   */
  resetPagination(): void {
    this.currentPage = 1;
  }

  onTabChange(tab: string): void {
    this.selectedTab = tab;
    this.resetPagination(); // Agrega esta línea
  }

  onDateChange(): void {
    this.resetPagination(); // Agrega esta línea cuando cambien las fechas
  }

  ngOnInit() {
    // Verificar si hay un gameId en los query params
    this.route.queryParams.subscribe((params) => {
      this.gameId = params['gameId'] ? +params['gameId'] : null;
      this.showingSpecificGame = !!this.gameId;

      if (this.gameId) {
        this.loadSpecificGameProgrammings();
      } else {
        this.loadAllProgrammings();
      }
    });
  }

  private loadAllProgrammings(): void {
    this.programmingGameService.getAllProgrammingGames().subscribe({
      next: (games: ProgrammingGame[]) => {
        this.activities = games.map((game) => ({
          id: game.Id,
          type: this.mapType(game.Name),
          title: game.Name,
          status: game.Activated ? 'Activo' : 'Desactivado',
          difficulty: this.mapDifficulty(game.MaximumTime),
        }));
      },
      error: (err) => {
        console.error('Error al cargar programaciones:', err);
      },
    });
  }

  backToAllProgrammings(): void {
    this.gameId = null;
    this.showingSpecificGame = false;
    this.gameTitle = '';
    this.router.navigate(['/mis-programaciones'], { queryParams: {} });
  }

  private loadSpecificGameProgrammings(): void {
    if (!this.gameId) return;

    // Obtener todas las programaciones y filtrar por GameInstancesId
    this.programmingGameService.getAllProgrammingGames().subscribe({
      next: (games: ProgrammingGame[]) => {
        // Filtrar programaciones que correspondan al juego específico
        const filteredGames = games.filter(
          (game) => game.GameInstancesId === this.gameId
        );

        this.activities = filteredGames.map((game) => ({
          id: game.Id,
          type: this.mapType(game.Name),
          title: game.Name,
          status: game.Activated ? 'Activo' : 'Desactivado',
          difficulty: this.mapDifficulty(game.MaximumTime),
        }));

        // Si hay actividades, usar el nombre del primer juego como título
        if (this.activities.length > 0) {
          this.gameTitle = this.activities[0].title;
        }
      },
      error: (err) => {
        console.error('Error al cargar programaciones del juego:', err);
      },
    });
  }

  mapType(name: string): string {
    // Mapea el nombre del juego a un tipo si es necesario
    if (name.includes('Ahorcado')) return 'Ahorcado';
    if (name.includes('Rompecabezas')) return 'Rompecabezas';
    if (name.includes('Memoria')) return 'Memoria';
    if (name.includes('Pupiletras')) return 'Pupiletras';
    return 'Otro';
  }

  mapDifficulty(maxTime: number): 'basico' | 'intermedio' | 'dificil' {
    if (maxTime <= 60) return 'basico';
    if (maxTime <= 180) return 'intermedio';
    return 'dificil';
  }
  selectedTab: string = 'Todos';
  startDate: string = '';
  endDate: string = '';
  menuAbierto: number | null = null;

  tabs: string[] = [
    'Todos',
    'Ahorcado',
    'Rompecabezas',
    'Memoria',
    'Pupiletras',
  ];

  getDifficultyClass(difficulty: string): string {
    switch (difficulty) {
      case 'basico':
        return 'bg-[#C9FFD0]';
      case 'intermedio':
        return 'bg-[#FFFEC2]';
      case 'dificil':
        return 'bg-[#FFB4B4]';
      default:
        return '';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'Ahorcado':
        return '🎯';
      case 'Rompecabezas':
        return '🧩';
      case 'Memoria':
        return '🃏';
      case 'Pupiletras':
        return '📝';
      default:
        return '📚';
    }
  }

  getFilteredActivities() {
    if (this.selectedTab === 'Todos') {
      return this.activities;
    }
    return this.activities.filter(
      (activity) => activity.type === this.selectedTab
    );
  }

  editarActividad(id: number) {
    console.log('Editar actividad', id);
  }

  showOptions(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.menuAbierto = this.menuAbierto === id ? null : id;
  }

  eliminarActividad(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      console.log(`Eliminar actividad con ID: ${id}`);
    }
  }
  verReporte(id: number): void {
    console.log(`Ver reporte de la actividad con ID: ${id}`);
  }
}
