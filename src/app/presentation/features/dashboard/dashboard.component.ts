// src/app/presentation/features/dashboard/dashboard.component.ts
import { Component, inject, Signal, effect } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { GameCardComponent } from '../../shared/game-card/game-card.component';
import { Game } from '../../../core/domain/model/game.model';
import { GameService } from '../../../core/infrastructure/api/game.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [GameCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  private readonly gameService = inject(GameService);
  private readonly PAGE_SIZE = 3;
  private readonly cdr = inject(ChangeDetectorRef);

  currentPage = 1;
  isFilterDropdownOpen = false;

  // ✅ CORRECTO: declaramos como campo de clase
  games: Signal<Game[]> = toSignal(this.gameService.getAllGames(), {
    initialValue: [],
  });

  displayedGames: Game[] = [];

  constructor() {
    // Reactividad con effect para actualizar displayedGames cuando cambien los juegos
    effect(() => {
      this.displayedGames = this.games().slice(0, this.PAGE_SIZE * this.currentPage);
      this.cdr.detectChanges();
    });
  }

  toggleFilterDropdown(): void {
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
  }

  get totalGames(): number {
    return this.games().length;
  }

  loadInitialGames(): void {
    this.currentPage = 1;
    this.displayedGames = this.games().slice(0, this.PAGE_SIZE);
    this.cdr.detectChanges();
  }

  loadMoreGames(): void {
    const startIndex = this.displayedGames.length;
    const endIndex = startIndex + this.PAGE_SIZE;
    const moreGames = this.games().slice(startIndex, endIndex);

    if (moreGames.length > 0) {
      this.displayedGames = [...this.displayedGames, ...moreGames];
      this.currentPage++;
      this.cdr.detectChanges();
    }
  }
}
