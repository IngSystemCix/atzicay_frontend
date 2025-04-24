// src/app/presentation/features/dashboard/dashboard.component.ts
import { Component } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { GameCardComponent } from '../../shared/game-card/game-card.component';

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
export class DashboardComponent {
  private PAGE_SIZE = 3;
  currentPage = 1;

  games: GameType[] = [
    {
      id: 1,
      title: 'Matemáticas Divertidas',
      level: 'Básico',
      description: 'Aprende operaciones básicas de forma divertida',
      rating: 4.8,
      author: 'Pedrito Patroclo',
      image: 'assets/images/math-game.png',
    },
    {
      id: 2,
      title: 'Aventura Gramatical',
      level: 'Intermedio',
      description: 'Mejora tu gramática con esta aventura interactiva',
      rating: 4.8,
      author: 'Pedrito Patroclo',
      image: 'assets/images/grammar-game.png',
    },
    {
      id: 3,
      title: 'Química Básica',
      level: 'Básico',
      description: 'Aprende los fundamentos de la química de forma interativa',
      rating: 4.8,
      author: 'Pedrito Patroclo',
      image: 'assets/images/chemistry-game.png',
    },
    {
      id: 4,
      title: 'Historia Mundial',
      level: 'Avanzado',
      description: 'Explora eventos históricos importantes de forma interactiva',
      rating: 4.5,
      author: 'María González',
      image: 'assets/images/history-game.png',
    },
    {
      id: 5,
      title: 'Física Elemental',
      level: 'Intermedio',
      description: 'Aprende conceptos de física a través de experimentos virtuales',
      rating: 4.7,
      author: 'Carlos Mendoza',
      image: 'assets/images/physics-game.png',
    },
    {
      id: 6,
      title: 'Biología Celular',
      level: 'Avanzado',
      description: 'Explora el mundo de las células y sus funciones',
      rating: 4.9,
      author: 'Ana Rodríguez',
      image: 'assets/images/biology-game.png',
    },
    {
      id: 7,
      title: 'Geometría Espacial',
      level: 'Básico',
      description: 'Aprende conceptos de geometría a través de juegos interactivos',
      rating: 4.6,
      author: 'Pedrito Patroclo',
      image: 'assets/images/geometry-game.png',
    },
    {
      id: 8,
      title: 'Aritmética Matemática',
      level: 'Intermedio',
      description: 'Aprende operaciones matemáticas a través de juegos divertidos',
      rating: 4.8,
      author: 'Pedrito Patroclo',
      image: 'assets/images/math-game.png',
    }
  ];

  displayedGames: GameType[] = [];

  constructor(private cdr: ChangeDetectorRef) {
    this.displayedGames = this.games.slice(0, this.PAGE_SIZE);
    console.log('Displayed games initialized:', this.displayedGames);
  }

  ngOnInit() {
    if (this.displayedGames.length === 0) {
      this.loadInitialGames();
    }
    this.cdr.detectChanges();
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
