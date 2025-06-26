import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GameConfigurationService } from '../../../../core/infrastructure/api/game-configuration.service';

interface Card {
  id: number;
  image: string;
  name: string;
  flipped: boolean;
  matched: boolean;
}

@Component({
  selector: 'app-game-memory',
  imports: [CommonModule],
  templateUrl: './game-memory.component.html',
  styleUrl: './game-memory.component.css'
})
export class GameMemoryComponent implements OnInit {
  cards: Card[] = [];
  flippedCards: Card[] = [];
  matches = 0;
  totalPairs = 8;
  gameStarted = false;
  gameCompleted = false;
  timer = 0;
  timerInterval: any;
  loading = false;
  error: string | null = null;

  planets = [
    { name: 'Júpiter', image: 'assets/jupiter.jpg' },
    { name: 'Mercurio', image: 'assets/mercurio.jpg' },
    { name: 'Tierra', image: 'assets/tierra.jpg' },
    { name: 'Neptuno', image: 'assets/neptuno.jpg' },
    { name: 'Saturno', image: 'assets/saturno.jpg' },
    { name: 'Urano', image: 'assets/urano.jpg' },
    { name: 'Venus', image: 'assets/venus.jpg' },
    { name: 'Marte', image: 'assets/marte.jpg' }
  ];

  constructor(
    private route: ActivatedRoute,
    private gameConfigService: GameConfigurationService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.params['id']);
    if (id && !isNaN(id)) {
      this.loading = true;
      this.gameConfigService.getGameConfiguration(id).subscribe({
        next: (response) => {
          // Aquí puedes manejar la respuesta del servicio
          console.log('Configuración del juego:', response);
          this.initializeGame(); // Inicializa el juego con la configuración recibida
        },
        error: (err) => {
          console.error('Error al obtener la configuración del juego:', err);
          this.error = 'Error al cargar la configuración del juego';
          this.loading = false;
        }
      });
    } else {
      this.error = 'No se proporcionó un ID de juego válido';
      this.loading = false;
    }
  }

  initializeGame() {
    this.cards = [];
    this.flippedCards = [];
    this.matches = 0;
    this.gameStarted = false;
    this.gameCompleted = false;
    this.timer = 0;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Crear pares de cartas
    let id = 0;
    this.planets.forEach(planet => {
      // Agregar dos cartas idénticas para cada planeta
      for (let i = 0; i < 2; i++) {
        this.cards.push({
          id: id++,
          image: planet.image,
          name: planet.name,
          flipped: false,
          matched: false
        });
      }
    });

    // Mezclar las cartas
    this.shuffleCards();
  }

  shuffleCards() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  startGame() {
    this.gameStarted = true;

    // Mostrar todas las cartas por 3 segundos
    this.cards.forEach(card => card.flipped = true);

    setTimeout(() => {
      this.cards.forEach(card => card.flipped = false);
      this.startTimer();
    }, 3000);
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timer++;
    }, 1000);
  }

  flipCard(card: Card) {
    if (!this.gameStarted || card.flipped || card.matched || this.flippedCards.length >= 2) {
      return;
    }

    card.flipped = true;
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.checkMatch();
    }
  }

  checkMatch() {
    const [card1, card2] = this.flippedCards;

    if (card1.name === card2.name) {
      // Es una pareja
      card1.matched = true;
      card2.matched = true;
      this.matches++;
      this.flippedCards = [];

      if (this.matches === this.totalPairs) {
        this.gameCompleted = true;
        clearInterval(this.timerInterval);
      }
    } else {
      // No es pareja, voltear después de 1 segundo
      setTimeout(() => {
        card1.flipped = false;
        card2.flipped = false;
        this.flippedCards = [];
      }, 1000);
    }
  }

  resetGame() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.initializeGame();
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.timer / 60);
    const seconds = this.timer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
