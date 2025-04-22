// src/app/presentation/features/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import {GameCardComponent} from '../../shared/game-card/game-card.component';
import {CommonModule} from '@angular/common';
import {HeaderComponent} from '../../shared/header/header.component';
import {SidebarComponent} from '../../shared/sidebar/sidebar.component';



@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, GameCardComponent,HeaderComponent,SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  games = [
    {
      id: 1,
      title: 'Matemáticas Divertidas',
      level: 'Básico',
      description: 'Aprende operaciones básicas de forma divertida',
      rating: 4.8,
      author: 'Pedrito Patroclo',
      image: 'assets/images/math-game.png'
    },
    {
      id: 2,
      title: 'Aventura Gramatical',
      level: 'Intermedio',
      description: 'Mejora tu gramática con esta aventura interactiva',
      rating: 4.8,
      author: 'Pedrito Patroclo',
      image: 'assets/images/grammar-game.png'
    },
    {
      id: 3,
      title: 'Química Básica',
      level: 'Básico',
      description: 'Aprende los fundamentos de la química de forma interativa',
      rating: 4.8,
      author: 'Pedrito Patroclo',
      image: 'assets/images/chemistry-game.png'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }
}
