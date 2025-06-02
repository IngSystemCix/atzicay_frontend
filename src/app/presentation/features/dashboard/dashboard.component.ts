import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { EMPTY, catchError, filter, switchMap, tap } from 'rxjs';
import { Game } from '../../../core/domain/model/game.model';
import { AuthService } from '../../../core/infrastructure/api/auth.service';
import { GameService } from '../../../core/infrastructure/api/game.service';
import { GameCardComponent } from '../../shared/game-card/game-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [GameCardComponent, FormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private readonly gameService = inject(GameService);
  private readonly PAGE_SIZE = 6;
  private auth0 = inject(Auth0Service);
  private backendAuthService = inject(AuthService);

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
        switchMap(() =>
          this.gameService.getAllGames(this.PAGE_SIZE).pipe(
            tap((games) => {
              this.allGames = games;
              this.currentOffset = games.length;
              this.hasMoreGames = games.length === this.PAGE_SIZE;
              this.applyFilters();
            }),
            catchError((err) => {
              console.error('Error cargando juegos:', err);
              return EMPTY;
            })
          )
        ),
        catchError((err) => {
          console.error(
            'Error en la autenticación con el backend o id_token:',
            err
          );
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
  loadMoreGames(): void {
    this.gameService.getAllGames(this.PAGE_SIZE).subscribe({
      next: (moreGames) => {
        if (moreGames.length > 0) {
          this.allGames = [...this.allGames, ...moreGames];
          this.currentOffset += moreGames.length;
          this.hasMoreGames = moreGames.length === this.PAGE_SIZE;
          this.applyFilters();
        } else {
          this.hasMoreGames = false;
        }
      },
      error: (err) => console.error('Error cargando más juegos:', err),
    });
  }

  // Getter para el total de juegos
  get totalGames(): number {
    return this.filteredGames.length;
  }
}
