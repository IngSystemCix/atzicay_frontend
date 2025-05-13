import { Component, inject, Signal, effect } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { GameCardComponent } from '../../shared/game-card/game-card.component';
import { Game } from '../../../core/domain/model/game.model';
import { GameService } from '../../../core/infrastructure/api/game.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [GameCardComponent, FormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  private readonly gameService = inject(GameService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly PAGE_SIZE = 6;

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
    { value: 'Solve the Word', label: 'Sopa de letras' }
  ];

  difficultyLevels = [
    { value: 'E', label: 'Fácil' },
    { value: 'M', label: 'Medio' },
    { value: 'D', label: 'Difícil' }
  ];

  // Datos de juegos
  allGames: Game[] = [];
  filteredGames: Game[] = [];
  displayedGames: Game[] = [];

  // Obtener juegos del servicio
  games: Signal<Game[]> = toSignal(this.gameService.getAllGames(), {
    initialValue: [],
  });

  constructor() {
    // Actualizar cuando cambian los juegos
    effect(() => {
      this.allGames = this.games();
      this.applyFilters();
      this.cdr.detectChanges();
    });
  }

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
    this.selectedTypes = this.selectedTypes.filter(t => t !== type);
    this.applyFilters();
  }

  removeLevelFilter(level: string): void {
    this.selectedLevels = this.selectedLevels.filter(l => l !== level);
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

    this.filteredGames = this.allGames.filter(game => {
      // Filtro por texto de búsqueda
      const matchesSearch = this.searchTerm === '' ||
        game.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        game.author.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtro por tipo
      const matchesType = this.selectedTypes.length === 0 ||
        this.selectedTypes.includes(game.type);

      // Filtro por nivel
      const matchesLevel = this.selectedLevels.length === 0 ||
        this.selectedLevels.includes(game.level);

      return matchesSearch && matchesType && matchesLevel;
    });

    this.displayedGames = this.filteredGames.slice(0, this.PAGE_SIZE * this.currentPage);
  }

  // Métodos auxiliares
  getTypeLabel(typeValue: string): string {
    const type = this.gameTypes.find(t => t.value === typeValue);
    return type ? type.label : typeValue;
  }

  getLevelLabel(levelValue: string): string {
    const level = this.difficultyLevels.find(l => l.value === levelValue);
    return level ? level.label : levelValue;
  }

  // Métodos de UI
  toggleFilterDropdown(): void {
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
  }

  loadMoreGames(): void {
    const startIndex = this.displayedGames.length;
    const endIndex = startIndex + this.PAGE_SIZE;
    const moreGames = this.filteredGames.slice(startIndex, endIndex);

    if (moreGames.length > 0) {
      this.displayedGames = [...this.displayedGames, ...moreGames];
      this.currentPage++;
      this.cdr.detectChanges();
    }
  }

  // Getter para el total de juegos
  get totalGames(): number {
    return this.filteredGames.length;
  }
}
