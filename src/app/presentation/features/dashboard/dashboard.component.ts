// src/app/presentation/features/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { GameCardComponent } from '../../shared/game-card/game-card.component';
import { AtzicayService } from '../../../core/infrastructure/api/atzicay.service';

type GameType = {
  id: number;
  title: string;
  level: string;
  description: string;
  rating: number;
  author: string;
  image: string;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [GameCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private PAGE_SIZE = 3;
  currentPage = 1;
  isFilterDropdownOpen = false;

  toggleFilterDropdown() {
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
  }

  games: any[]=[];

  displayedGames: GameType[] = [];

  constructor(private cdr: ChangeDetectorRef, private atzicayService: AtzicayService) {
    this.displayedGames = this.games.slice(0, this.PAGE_SIZE);
    console.log('Displayed games initialized:', this.displayedGames);
  }

  ngOnInit() {
    if (this.displayedGames.length === 0) {
      this.loadInitialGames();
    }
    this.cdr.detectChanges();

    this.atzicayService.getAllGameInstances().subscribe(data=>{
      this.games=data;
    })
  }

  get totalGames(): number {
    return this.games.length;
  }

  loadInitialGames(): void {
    this.currentPage = 1;
    this.displayedGames = this.games.slice(0, this.PAGE_SIZE);
    console.log('Initial games loaded:', this.displayedGames);
    this.cdr.detectChanges();
  }

  loadMoreGames(): void {
    const startIndex = this.displayedGames.length;
    const endIndex = startIndex + this.PAGE_SIZE;

    const moreGames = this.games.slice(startIndex, endIndex);

    if (moreGames.length > 0) {
      this.displayedGames = [...this.displayedGames, ...moreGames];
      this.currentPage++;
      console.log('More games loaded, total:', this.displayedGames.length);
      this.cdr.detectChanges();
    }
  }

  refreshGames(): void {
    const newGames: GameType[] = [
      {
        id: this.games.length + 1,
        title: 'Programación Divertida',
        level: 'Intermedio',
        description: 'Aprende a programar jugando con retos y puzzles',
        rating: 4.9,
        author: 'Lina Dev',
        image: 'assets/images/code-game.png',
      },
      {
        id: this.games.length + 2,
        title: 'Inglés Interactivo',
        level: 'Básico',
        description: 'Practica inglés con diálogos y juegos',
        rating: 4.7,
        author: 'John Teacher',
        image: 'assets/images/english-game.png',
      }
    ];

    // Simular "nuevos juegos en el backend"
    this.games = [...this.games, ...newGames];

    // Reiniciar la visualización
    this.displayedGames = this.games.slice(0, this.PAGE_SIZE * this.currentPage);
    console.log('Juegos actualizados:', this.games);
    this.cdr.detectChanges();
  }


}
