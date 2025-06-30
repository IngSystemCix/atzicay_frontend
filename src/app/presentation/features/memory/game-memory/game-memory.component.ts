import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GameConfigurationService } from '../../../../core/infrastructure/api/game-configuration.service';
import { GameConfiguration } from '../../../../core/domain/model/game-configuration.model';
import { BaseAuthenticatedComponent } from '../../../../core/presentation/shared/base-authenticated.component';
import { GameAlertService, GameAlertConfig } from '../../../../core/infrastructure/service/game-alert.service';
import { RatingModalService } from '../../../../core/infrastructure/service/rating-modal.service';
import { GameAudioService } from '../../../../core/infrastructure/service/game-audio.service';

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
export class GameMemoryComponent extends BaseAuthenticatedComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private gameConfigService = inject(GameConfigurationService);
  private gameAlertService = inject(GameAlertService);
  private ratingModalService = inject(RatingModalService);
  private gameAudioService = inject(GameAudioService);
  
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
  gameConfig: GameConfiguration | null = null;
  userAssessed = false; // Nueva propiedad para controlar valoración

  // Header control
  headerExpanded = true;
  
  // Pista control
  mostrarPista = false;

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

  constructor() {
    super();
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  override ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    super.ngOnDestroy();
  }

  onAuthenticationReady(userId: number): void {
    const id = Number(this.route.snapshot.params['id']);
    if (id && !isNaN(id)) {
      this.cargarConfiguracionJuego(id);
    } else {
      this.error = 'No se proporcionó un ID de juego válido';
      this.loading = false;
    }
  }

  private cargarConfiguracionJuego(id: number): void {
    this.loading = true;
    this.error = null;

    // Get userId from authenticated user
    const userId = this.currentUserId;

    this.gameConfigService.getGameConfiguration(id, userId || undefined, false).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.gameConfig = response.data;
          this.aplicarConfiguracion(response.data);
          this.initializeGame();
        } else {
          this.error = 'Error al cargar la configuración del juego';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener la configuración del juego:', err);
        this.error = 'Error al cargar la configuración del juego';
        this.loading = false;
      }
    });
  }

  private aplicarConfiguracion(data: GameConfiguration): void {
    // Guardar el estado de evaluación del usuario
    this.userAssessed = data.assessed || false;
    
    // Aquí puedes aplicar otras configuraciones específicas del juego de memoria
    // como configuraciones de tiempo, colores, etc.
  }

  private async showSuccessAlert(): Promise<void> {
    const timeUsed = this.getFormattedTime();
    const config: GameAlertConfig = {
      gameType: 'memory',
      gameName: 'Memoria',
      timeUsed,
      attempts: this.timer // Puedes ajustar esto según tengas una métrica de intentos
    };

    const result = await this.gameAlertService.showSuccessAlert(config);
    if (result.isConfirmed) {
      this.resetGame();
    }
  }

  private async showRatingAlert(): Promise<void> {
    if (!this.gameConfig || !this.currentUserId) return;

    try {
      const gameInstanceId = this.gameConfig.game_instance_id;
      const gameName = this.gameConfig.game_name || 'Memoria';
      
      const result = await this.ratingModalService.showRatingModal(
        gameInstanceId, 
        this.currentUserId, 
        gameName
      );
      
      if (result) {
        console.log('Valoración enviada exitosamente');
        this.userAssessed = true;
      }
    } catch (error) {
      console.error('Error al mostrar modal de valoración:', error);
    }
  }

  private showRatingModal() {
    // Método legacy - usar showRatingAlert en su lugar
    this.showRatingAlert();
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
    this.gameAudioService.playGameStart();
    this.gameStarted = true;

    // Mostrar todas las cartas por 3 segundos
    this.cards.forEach(card => card.flipped = true);

    setTimeout(() => {
      this.gameAudioService.playMemoryCardHide();
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

    this.gameAudioService.playMemoryCardFlip();
    card.flipped = true;
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.checkMatch();
    }
  }

  async checkMatch() {
    const [card1, card2] = this.flippedCards;

    if (card1.name === card2.name) {
      // Es una pareja
      this.gameAudioService.playMemoryCardMatch();
      card1.matched = true;
      card2.matched = true;
      this.matches++;
      this.flippedCards = [];

      if (this.matches === this.totalPairs) {
        this.gameAudioService.playMemoryAllMatched();
        this.gameCompleted = true;
        clearInterval(this.timerInterval);
        
        console.log('🧠 Juego Memory completado con éxito');
        console.log('📊 Estado de evaluación:', { userAssessed: this.userAssessed, gameAssessed: this.gameConfig?.assessed });
        
        // Mostrar modal de valoración si el usuario no ha evaluado el juego
        if (!this.userAssessed && this.gameConfig && !this.gameConfig.assessed) {
          console.log('✨ Mostrando modal de valoración...');
          await this.showRatingAlert();
        } else {
          console.log('❌ Modal de valoración NO se muestra porque:', {
            userAssessed: this.userAssessed,
            gameAssessed: this.gameConfig?.assessed
          });
        }
        
        // Mostrar modal de éxito
        this.showSuccessAlert();
      }
    } else {
      // No es pareja, voltear después de 1 segundo
      this.gameAudioService.playMemoryCardMismatch();
      setTimeout(() => {
        this.gameAudioService.playMemoryCardHide();
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

  // Métodos para el header
  toggleHeader(): void {
    this.headerExpanded = !this.headerExpanded;
  }

  get tituloJuego(): string {
    return this.gameConfig?.game_name || '🪐 Juego de Memoria - Planetas';
  }

  get descripcionJuego(): string {
    return this.gameConfig?.game_description || 'Encuentra todas las parejas de planetas para completar el juego';
  }

  get porcentajeProgreso(): number {
    return this.totalPairs > 0 ? Math.round((this.matches / this.totalPairs) * 100) : 0;
  }

  volverAlDashboard(): void {
    // Navegar de vuelta al dashboard o página anterior
    window.history.back();
  }

  togglePista(): void {
    this.mostrarPista = !this.mostrarPista;
  }

  get pistaTexto(): string {
    return this.gameConfig?.game_description || 'Memoriza la posición de los planetas cuando se muestren al inicio. Luego encuentra las parejas haciendo clic en las cartas.';
  }
}
