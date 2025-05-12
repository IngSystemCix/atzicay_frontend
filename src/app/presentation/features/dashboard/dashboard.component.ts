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

  refreshGames(): void {
    // Simulación: en un caso real, esta lógica debería disparar un fetch desde el backend.
    const currentGames = this.games();

    const newGames: Game[] = [
      {
        id: currentGames.length + 1,
        title: 'Programación Divertida',
        level: 'Intermedio',
        description: 'Aprende a programar jugando con retos y puzzles',
        rating: 4.9,
        author: 'Lina Dev',
        image: 'assets/images/code-game.png',
      },
      {
        id: currentGames.length + 2,
        title: 'Inglés Interactivo',
        level: 'Básico',
        description: 'Practica inglés con diálogos y juegos',
        rating: 4.7,
        author: 'John Teacher',
        image: 'assets/images/english-game.png',
      },
    ];

    console.warn(
      'refreshGames: Esta acción debería hacerse desde el backend o usando Subject en el servicio.'
    );

    this.displayedGames = [...currentGames, ...newGames].slice(
      0,
      this.PAGE_SIZE * this.currentPage
    );
    this.cdr.detectChanges();
  }
}
