import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { BehaviorSubject, EMPTY, catchError, debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs';
import { Game } from '../../../core/domain/model/game.model';
import { AuthService } from '../../../core/infrastructure/api/auth.service';
import { GameService } from '../../../core/infrastructure/api/game.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private readonly gameService = inject(GameService);
  protected PAGE_SIZE = 6;
  private auth0 = inject(Auth0Service);
  private backendAuthService = inject(AuthService);

  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;
  isDropdownOpen = false;
  activeDropdownId: number | null = null;
  ratingArray: number[] = [1, 2, 3, 4, 5];

  getGameRoute(gameType: string, id: number): string {
    switch (gameType.toLowerCase()) {
      case 'hangman':
        return `/juegos/jugar-hangman/${id}`;
      case 'puzzle':
        return `/juegos/jugar-puzzle/${id}`;
      case 'memory':
        return `/juegos/jugar-memory/${id}`;
      case 'solve-the-word':
        return `/juegos/solve-the-word/${id}`;
      default:
        return '/juegos';
    }
  }

  private limitSubject = new BehaviorSubject<{ limit: number; offset: number }>(
    { limit: 10, offset: 0 }
  );
  ngOnInit() {
    this.auth0.isAuthenticated$
      .pipe(
        filter((isAuth) => isAuth),
        switchMap(() => this.auth0.idTokenClaims$),
        switchMap((claims) => {
          const idToken = claims?.__raw;
          if (!idToken) {
            console.error('No se obtuvo id_token');
            return EMPTY;
          }
          return this.backendAuthService.login(idToken).pipe(
            tap((response) => {
              sessionStorage.setItem('access_token', response.access_token);
              const { Id, ...userWithoutId } = response.user;
              sessionStorage.setItem('user', JSON.stringify(userWithoutId));

            })
          );
        }),
        catchError((err) => {
          console.error(
            'Error en la autenticación con el backend o id_token:',
            err
          );
          return EMPTY;
        })
      )
      .subscribe();

    this.limitSubject.asObservable().pipe(
      debounceTime(300),
      distinctUntilChanged(
        (prev, curr) =>
          prev.limit === curr.limit && prev.offset === curr.offset
      ),
      switchMap((params) =>
        this.gameService.getAllGames(params.limit, params.offset)
      ),
      tap((games) => {
        this.allGames = [...this.allGames, ...games]; // acumular
        this.currentOffset += games.length;
        this.hasMoreGames = games.length === this.PAGE_SIZE;
        this.applyFilters();
      }),
      catchError((err) => {
        console.error('Error cargando juegos:', err);
        return EMPTY;
      })
    )
      .subscribe();
  }

  // Estado del componente
  currentPage = 1;
  isFilterDropdownOpen = false;
  searchTerm = '';
  selectedTypes: string[] = [];
  selectedLevels: string[] = [];

  // Opciones de filtros
  gameTypes = [
    { value: 'Memory', label: 'Memoria' },
    { value: 'Hangman', label: 'Ahorcado' },
    { value: 'Puzzle', label: 'Rompecabezas' },
    { value: 'Solve the Word', label: 'Sopa de letras' },
  ];

  difficultyLevels = [
    { value: 'E', label: 'Fácil' },
    { value: 'M', label: 'Medio' },
    { value: 'D', label: 'Difícil' },
  ];

  // Datos de juegos
  allGames: Game[] = [];
  filteredGames: Game[] = [];
  displayedGames: Game[] = [];

  // Métodos para manejar filtros
  toggleTypeFilter(type: string): void {
    const index = this.selectedTypes.indexOf(type);
    if (index === -1) {
      this.selectedTypes.push(type);
    } else {
      this.selectedTypes.splice(index, 1);
    }
    this.applyFilters();
  }

  toggleLevelFilter(level: string): void {
    const index = this.selectedLevels.indexOf(level);
    if (index === -1) {
      this.selectedLevels.push(level);
    } else {
      this.selectedLevels.splice(index, 1);
    }
    this.applyFilters();
  }

  removeTypeFilter(type: string): void {
    this.selectedTypes = this.selectedTypes.filter((t) => t !== type);
    this.applyFilters();
  }

  removeLevelFilter(level: string): void {
    this.selectedLevels = this.selectedLevels.filter((l) => l !== level);
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedTypes = [];
    this.selectedLevels = [];
    this.searchTerm = '';
    this.applyFilters();
    this.isFilterDropdownOpen = false;
  }

  applyFilters(): void {
    this.currentPage = 1;

    this.filteredGames = this.allGames.filter((game) => {
      // Filtro por texto de búsqueda
      const matchesSearch =
        this.searchTerm === '' ||
        game.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        game.description
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        game.author.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtro por tipo
      const matchesType =
        this.selectedTypes.length === 0 ||
        this.selectedTypes.includes(game.type);

      // Filtro por nivel
      const matchesLevel =
        this.selectedLevels.length === 0 ||
        this.selectedLevels.includes(game.level);

      return matchesSearch && matchesType && matchesLevel;
    });

    this.displayedGames = this.filteredGames.slice(
      0,
      this.PAGE_SIZE * this.currentPage
    );
  }

  getLevelClasses(level: string): string {
    switch (level.toLowerCase()) {
      case 'e':
        return 'bg-[#C9FFD0] text-green-800';
      case 'm':
        return 'bg-[#FFFEC2] text-yellow-800';
      case 'd':
        return 'bg-[#FFB4B4] text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  }

  getLevelText(level: string): string {
    switch (level) {
      case 'E':
        return 'Fácil';
      case 'M':
        return 'Intermedio';
      case 'D':
        return 'Difícil';
      default:
        return 'Desconocido';
    }
  }

  dropdownToggle(gameId: number) {
    if (this.activeDropdownId === gameId) {
      this.activeDropdownId = null;
    } else {
      this.activeDropdownId = gameId;
    }
  }

  isDropdownActive(gameId: number): boolean {
    return this.activeDropdownId === gameId;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (
      this.dropdownMenu &&
      !this.dropdownMenu.nativeElement.contains(event.target)
    ) {
      this.closeDropdown();
    }
  }

  closeDropdown() {
    this.activeDropdownId = null;
  }

  // Métodos auxiliares
  getTypeLabel(typeValue: string): string {
    const type = this.gameTypes.find((t) => t.value === typeValue);
    return type ? type.label : typeValue;
  }

  getLevelLabel(levelValue: string): string {
    const level = this.difficultyLevels.find((l) => l.value === levelValue);
    return level ? level.label : levelValue;
  }

  // Métodos de UI
  toggleFilterDropdown(): void {
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
  }
  totalGamesInDB = 0;
  currentOffset = 0;
  hasMoreGames = true;

  onChangeLimit(newLimit: number) {
    this.PAGE_SIZE = newLimit;
    this.currentOffset = 0;
    this.allGames = [];
    this.hasMoreGames = true;
    this.limitSubject.next({
      limit: this.PAGE_SIZE,
      offset: this.currentOffset,
    });
  }

  loadMoreGames(): void {
    if (!this.hasMoreGames) return;

    this.limitSubject.next({
      limit: this.PAGE_SIZE,
      offset: this.currentOffset,
    });
  }

  // Getter para el total de juegos
  get totalGames(): number {
    return this.filteredGames.length;
  }
}
