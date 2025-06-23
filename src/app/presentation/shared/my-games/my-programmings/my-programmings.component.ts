import { Component, OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MyProgrammingGamesService } from '../../../../core/infrastructure/api/my-programming-games.service';
import { MyProgrammingGame } from '../../../../core/domain/model/my-programming-game.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UserSessionService } from '../../../../core/infrastructure/service/user-session.service';

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
    private userSession: UserSessionService
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
    if (confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      console.log(`Eliminar actividad con ID: ${id}`);
    }
  }
  verReporte(id: number): void {
    console.log(`Ver reporte de la actividad con ID: ${id}`);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
