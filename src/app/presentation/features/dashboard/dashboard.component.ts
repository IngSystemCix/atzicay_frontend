import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  inject,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from '../../../core/infrastructure/api/auth.service';
import { GameInstance } from '../../../core/domain/model/game-instance.model';
import { AtzicayButtonComponent } from '../../components/atzicay-button/atzicay-button.component';
import { GameInstanceService } from '../../../core/infrastructure/api/game-instance.service';
import { UserSessionService } from '../../../core/infrastructure/service/user-session.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, AtzicayButtonComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private gameInstanceService = inject(GameInstanceService);
  private userSessionService = inject(UserSessionService);
  protected PAGE_SIZE = 6;
  private auth0 = inject(Auth0Service);
  private backendAuthService = inject(AuthService);
  private subscription = new Subscription();

  isDropdownOpen = false;
  activeDropdownId: number | null = null;
  ratingArray: number[] = [1, 2, 3, 4, 5];
isHeaderMinimized: boolean = false;
  getGameRoute(gameType: string, id: number): string {
    const normalizedType = gameType.replace(/\s|_/g, '').toLowerCase();
    switch (normalizedType) {
      case 'hangman':
        return `/juegos/jugar-hangman/${id}`;
      case 'puzzle':
        return `/juegos/jugar-puzzle/${id}`;
      case 'memory':
        return `/juegos/jugar-memory/${id}`;
      case 'solvetheword':
        return `/juegos/jugar-solve-the-word/${id}`;
      default:
        return '/juegos';
    }
  }

  private limitSubject = new BehaviorSubject<{ limit: number }>({ limit: 6 });
  
  ngOnInit(): void {
    // Usar el UserSessionService optimizado para esperar el token
    if (this.userSessionService.isAuthenticated()) {
      this.loadGameInstances();
    } else {
      this.subscription.add(
        this.userSessionService.waitForToken$(5000).subscribe({
          next: (token) => {
            this.loadGameInstances();
          },
          error: (err) => {
            console.error('[Dashboard] Error esperando token:', err);
            // Fallback: intentar cargar igualmente
            this.loadGameInstances();
          }
        })
      );
    }
  }
toggleHeaderSize(): void {
  this.isHeaderMinimized = !this.isHeaderMinimized;
}

getTypeIcon(typeValue: string): string {
  const icons: { [key: string]: string } = {
    'all': '🎮',
    'hangman': '🪢',
    'memory': '🧠',
    'puzzle': '🧩',
    'solve_the_word': '🔤'
  };
  return icons[typeValue] || '🎮';
}
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadGameInstances(): void {
    this.gameInstanceService
      .getGameInstances(this.searchTerm, this.selectedType, this.PAGE_SIZE, 0)
      .subscribe({
        next: (response) => {
          // Filtrado adicional por nombre o autor en frontend
          const search = this.searchTerm.trim().toLowerCase();
          let games = response.data.data;
          if (search) {
            games = games.filter(
              (game) =>
                game.name.toLowerCase().includes(search) ||
                game.author.toLowerCase().includes(search)
            );
          }
          this.allGames = games;
          this.filteredGames = games;
          this.displayedGames = games.slice(0, this.PAGE_SIZE);
          this.currentOffset = games.length;
          this.hasMoreGames = games.length === this.PAGE_SIZE;
          (this as any).isLoading = false;
        },
        error: (err) => {
          console.error('Error cargando instancias de juegos:', err);
          this.allGames = [];
          this.filteredGames = [];
          this.displayedGames = [];
        },
      });
  }

  currentPage = 1;
  isFilterDropdownOpen = false;
  searchTerm = '';
  selectedType: string = 'all';
  selectedLevels: string[] = [];

  gameTypes = [
    { value: 'hangman', label: 'Ahorcado' },
    { value: 'memory', label: 'Memoria' },
    { value: 'puzzle', label: 'Rompecabezas' },
    { value: 'solve_the_word', label: 'Sopa de letras' },
  ];

  difficultyLevels = [
    { value: 'E', label: 'Fácil' },
    { value: 'M', label: 'Medio' },
    { value: 'D', label: 'Difícil' },
  ];

  allGames: GameInstance[] = [];
  filteredGames: GameInstance[] = [];
  displayedGames: GameInstance[] = [];

  toggleTypeFilter(type: string): void {
    if (this.selectedType === type) {
      this.selectedType = 'all';
    } else {
      this.selectedType = type;
    }
    this.applyFilters();
  }

  removeTypeFilter(type: string): void {
    if (this.selectedType === type) {
      this.selectedType = 'all';
      this.applyFilters();
    }
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

  removeLevelFilter(level: string): void {
    this.selectedLevels = this.selectedLevels.filter((l) => l !== level);
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedType = 'all';
    this.selectedLevels = [];
    this.searchTerm = '';
    this.applyFilters();
    this.isFilterDropdownOpen = false;
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadGameInstances();
  }

  loadMoreGames(): void {
    if (!this.hasMoreGames) return;

    const newLimit = this.PAGE_SIZE + 6;

    this.gameInstanceService
      .getGameInstances(this.searchTerm, this.selectedType, newLimit, 0)
      .subscribe({
        next: (response) => {
          if (response.data.data.length > this.allGames.length) {
            this.allGames = response.data.data;
            this.currentOffset = this.allGames.length;
            this.hasMoreGames = this.allGames.length === newLimit;
            this.PAGE_SIZE = newLimit;
          } else {
            this.hasMoreGames = false;
          }
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error cargando más instancias de juegos:', err);
        },
      });
  }

  getLevelClasses(level: string): string {
    switch (level.toLowerCase()) {
      case 'e':
        return 'bg-[#C9FFD0] text-green-800';
      case 'm':
        return 'bg-[#FFFEC2] text-yellow-800';
      case 'h':
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
      case 'H':
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
    const isActive = this.activeDropdownId === gameId;
    return isActive;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const dropdownElement = target.closest('.game-card-dropdown');
    const buttonElement = target.closest('button[title="Opciones del juego"]');
    
    // Si el clic no fue en un dropdown ni en un botón de opciones, cerrar todos los dropdowns
    if (!dropdownElement && !buttonElement) {
      this.closeDropdown();
    }
  }

  closeDropdown() {
    this.activeDropdownId = null;
  }

  getTypeLabel(typeValue: string): string {
    const type = this.gameTypes.find((t) => t.value === typeValue);
    return type ? type.label : typeValue;
  }

  getLevelLabel(levelValue: string): string {
    const level = this.difficultyLevels.find((l) => l.value === levelValue);
    return level ? level.label : levelValue;
  }

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
    });
  }

  get totalGames(): number {
    return this.filteredGames.length;
  }

  getGameImage(type: string): string {
    switch (type) {
      case 'hangman':
        return 'assets/ahorcado.png';
      case 'memory':
        return 'assets/memoria.png';
      case 'puzzle':
        return 'assets/rompecabezas.png';
      case 'solve_the_word':
        return 'assets/pupiletras.png';
      default:
        return 'assets/default-game.png';
    }
  }

  // Si el usuario escribe en el buscador, aplicar el filtro en frontend
  onSearchTermChange(): void {
    const search = this.searchTerm.trim().toLowerCase();
    if (search) {
      this.filteredGames = this.allGames.filter(
        (game) =>
          game.name.toLowerCase().includes(search) ||
          game.author.toLowerCase().includes(search)
      );
    } else {
      this.filteredGames = this.allGames;
    }
    this.displayedGames = this.filteredGames.slice(0, this.PAGE_SIZE);
    this.currentOffset = this.filteredGames.length;
    this.hasMoreGames = this.filteredGames.length === this.PAGE_SIZE;
  }

  // trackBy function for gameTypes ngFor
  trackByTypeValue(_index: number, type: { value: string; label: string }) {
    return type.value;
  }
}
