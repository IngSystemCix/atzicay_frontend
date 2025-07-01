import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameConfigurationService } from '../../../../core/infrastructure/api/game-configuration.service';
import { GameConfiguration } from '../../../../core/domain/model/game-configuration.model';
import { BaseAuthenticatedComponent } from '../../../../core/presentation/shared/base-authenticated.component';
import { GameAlertService, GameAlertConfig } from '../../../../core/infrastructure/service/game-alert.service';
import { RatingModalService } from '../../../../core/infrastructure/service/rating-modal.service';
import { GameAudioService } from '../../../../core/infrastructure/service/game-audio.service';
import { FloatingLogoComponent } from '../../../shared/components/floating-logo/floating-logo.component';

interface Card {
  id: number;
  image: string;
  name: string;
  flipped: boolean;
  matched: boolean;
  isImageCard?: boolean; // Para distinguir entre imagen y texto
  text?: string; // Para modo imagen-descripción
}

@Component({
  selector: 'app-game-memory',
  imports: [CommonModule, FloatingLogoComponent],
  templateUrl: './game-memory.component.html',
  styleUrl: './game-memory.component.css'
})
export class GameMemoryComponent extends BaseAuthenticatedComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
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
  attempts = 0; // Contador de intentos (pares volteados)

  // Header control
  headerExpanded = false;
  
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
    
    // Verificar que hay pares de memoria configurados
    if (!data.memory_pairs || data.memory_pairs.length === 0) {
      this.error = 'No hay pares de memoria configurados para este juego';
      return;
    }
    
    // Configurar el número total de pares
    this.totalPairs = data.memory_pairs.length;
    
    console.log('Memory pairs loaded:', data.memory_pairs);
    console.log('Game mode:', data.memory_pairs[0]?.mode);
  }

  private async showSuccessAlert(): Promise<void> {
    const timeUsed = this.getFormattedTime();
    const config: GameAlertConfig = {
      gameType: 'memory',
      gameName: 'Memoria',
      timeUsed,
      attempts: this.attempts // Usar el contador real de intentos
    };

    const result = await this.gameAlertService.showSuccessAlert(config);
    if (result.isConfirmed) {
      this.resetGame();
    } else if (result.isDismissed) {
      // Si presiona "Ir al Dashboard" o cierra el modal
      this.volverAlDashboard();
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
    this.attempts = 0; // Reiniciar contador de intentos

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Si no hay configuración del juego, usar datos por defecto
    if (!this.gameConfig || !this.gameConfig.memory_pairs || this.gameConfig.memory_pairs.length === 0) {
      this.initializeDefaultGame();
      return;
    }

    // Crear cartas desde la configuración del juego
    this.createCardsFromConfiguration();

    // Mezclar las cartas
    this.shuffleCards();
  }

  private initializeDefaultGame() {
    // Código original para el juego por defecto con planetas
    let id = 0;
    this.planets.forEach(planet => {
      // Agregar dos cartas idénticas para cada planeta
      for (let i = 0; i < 2; i++) {
        this.cards.push({
          id: id++,
          image: planet.image,
          name: planet.name,
          flipped: false,
          matched: false,
          isImageCard: true
        });
      }
    });
  }

  private createCardsFromConfiguration() {
    if (!this.gameConfig?.memory_pairs) return;

    let id = 0;
    const mode = this.gameConfig.memory_pairs[0]?.mode || 'II';

    this.gameConfig.memory_pairs.forEach((pair, index) => {
      if (mode === 'II') {
        // Modo Imagen-Imagen: crear dos cartas con imágenes
        // Ambas cartas deben tener el mismo nombre para que sean reconocidas como pareja
        const pairName = `pair_${index}`;
        
        if (pair.path_image1) {
          this.cards.push({
            id: id++,
            image: this.convertToWebPath(pair.path_image1),
            name: pairName,
            flipped: false,
            matched: false,
            isImageCard: true
          });
        }
        
        if (pair.path_image2) {
          this.cards.push({
            id: id++,
            image: this.convertToWebPath(pair.path_image2),
            name: pairName,
            flipped: false,
            matched: false,
            isImageCard: true
          });
        }
      } else if (mode === 'ID') {
        // Modo Imagen-Descripción: crear una carta con imagen y una con texto
        if (pair.path_image1) {
          this.cards.push({
            id: id++,
            image: this.convertToWebPath(pair.path_image1),
            name: `pair_${index}`,
            flipped: false,
            matched: false,
            isImageCard: true
          });
        }
        
        if (pair.description_image) {
          this.cards.push({
            id: id++,
            image: '', // Sin imagen para la carta de texto
            name: `pair_${index}`,
            text: pair.description_image,
            flipped: false,
            matched: false,
            isImageCard: false
          });
        }
      }
    });

    console.log('Cards created from configuration:', this.cards);
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
    
    // Incrementar contador de intentos cada vez que se comparan dos cartas
    this.attempts++;

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
        console.log('📊 Intentos realizados:', this.attempts);
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
    this.router.navigate(['/dashboard']);
  }

  togglePista(): void {
    this.mostrarPista = !this.mostrarPista;
  }

  get pistaTexto(): string {
    return this.gameConfig?.game_description || 'Memoriza la posición de los planetas cuando se muestren al inicio. Luego encuentra las parejas haciendo clic en las cartas.';
  }

  getGridClasses(): string {
    const numCards = this.cards.length;
    
    // Determinar el número de columnas basado en el número de cartas
    if (numCards <= 8) {
      return 'grid-cols-4'; // 2 filas de 4
    } else if (numCards <= 12) {
      return 'grid-cols-6'; // 2 filas de 6
    } else if (numCards <= 16) {
      return 'grid-cols-4'; // 4 filas de 4
    } else {
      return 'grid-cols-6'; // Por defecto 6 columnas
    }
  }

  onImageError(card: Card): void {
    console.warn('Error loading image for card:', card);
    // Opcionalmente, se puede mostrar una imagen por defecto
  }

  /**
   * Convierte una ruta absoluta del sistema de archivos a una ruta web válida
   * @param absolutePath Ruta absoluta del sistema (ej: C:\Users\...\public\storage\memory\imagen.jpg)
   * @returns Ruta web relativa (ej: storage/memory/imagen.jpg)
   */
  private convertToWebPath(absolutePath: string): string {
    if (!absolutePath) return '';
    
    // Buscar la parte "storage" en la ruta
    const storageIndex = absolutePath.indexOf('storage');
    if (storageIndex !== -1) {
      // Extraer desde "storage" hasta el final y normalizar las barras
      return absolutePath.substring(storageIndex).replace(/\\/g, '/');
    }
    
    // Si no encuentra "storage", buscar "public" y extraer desde ahí
    const publicIndex = absolutePath.indexOf('public');
    if (publicIndex !== -1) {
      const pathFromPublic = absolutePath.substring(publicIndex + 7); // +7 para saltar "public/"
      return pathFromPublic.replace(/\\/g, '/');
    }
    
    // Como último recurso, intentar extraer solo el nombre del archivo
    const fileName = absolutePath.split(/[\\\/]/).pop();
    return `storage/memory/${fileName || ''}`;
  }

  // Método para determinar si el juego está en modo imagen-descripción
  get isImageDescriptionMode(): boolean {
    return this.gameConfig?.memory_pairs?.[0]?.mode === 'ID';
  }

  // Método para determinar si el juego está en modo imagen-imagen
  get isImageImageMode(): boolean {
    return this.gameConfig?.memory_pairs?.[0]?.mode === 'II';
  }
}
