import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameConfigurationService } from '../../../../core/infrastructure/api/game-configuration.service';
import { GameConfiguration } from '../../../../core/domain/model/game-configuration.model';
import { BaseAuthenticatedComponent } from '../../../../core/presentation/shared/base-authenticated.component';
import { GameAlertService, GameAlertConfig } from '../../../../core/infrastructure/service/game-alert.service';
import { RatingModalService } from '../../../../core/infrastructure/service/rating-modal.service';
import { GameAudioService } from '../../../../core/infrastructure/service/game-audio.service';
import { GameUrlService } from '../../../../core/infrastructure/services/game-url.service';
import { GameLoadingService } from '../../../../core/infrastructure/services/game-loading.service';
import { FloatingLogoComponent } from '../../../components/floating-logo/floating-logo.component';

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
  private gameUrlService = inject(GameUrlService);
  private gameLoadingService = inject(GameLoadingService);
  
  cards: Card[] = [];
  flippedCards: Card[] = [];
  matches = 0;
  totalPairs = 0; // Se configurará dinámicamente
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
    // Mostrar loading rápido para el juego de memoria
    this.gameLoadingService.showFastGameLoading('Cargando Memoria...');
    
    // Capturar parámetros de ruta - puede ser 'id' o 'token'
    const id = this.route.snapshot.params['id'];
    const token = this.route.snapshot.params['token'];
        
    if (token) {
      // Si tenemos un token, validarlo primero
      this.gameUrlService.validateGameToken(token).subscribe({
        next: (response) => {
          if (response.valid && response.gameInstanceId) {
            this.cargarConfiguracionJuego(response.gameInstanceId);
          } else {
            console.error('❌ [Memory] Token inválido o expirado');
            this.error = 'El enlace del juego ha expirado o no es válido';
            this.loading = false;
            this.gameLoadingService.hideFast();
          }
        },
        error: (error) => {
          console.error('❌ [Memory] Error validando token:', error);
          this.error = 'Error al validar el acceso al juego';
          this.loading = false;
          this.gameLoadingService.hideFast();
        }
      });
    } else if (id) {
      // Si tenemos un ID tradicional, usarlo directamente
      const gameId = Number(id);
      if (gameId && !isNaN(gameId)) {
        this.cargarConfiguracionJuego(gameId);
      } else {
        console.error('❌ [Memory] ID de juego inválido:', id);
        this.error = 'ID de juego inválido';
        this.loading = false;
        this.gameLoadingService.hideFast();
      }
    } else {
      console.error('❌ [Memory] No se encontró ID ni token en la URL');
      this.error = 'No se proporcionó un ID de juego válido';
      this.loading = false;
      this.gameLoadingService.hideFast();
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
          // Hacer la inicialización async
          this.initializeGame().then(() => {
            this.gameLoadingService.hideFast();
          }).catch((error) => {
            console.error('Error inicializando juego:', error);
            this.error = 'Error al inicializar el juego';
            this.gameLoadingService.hideFast();
          });
        } else {
          this.error = 'Error al cargar la configuración del juego';
          this.gameLoadingService.hideFast();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener la configuración del juego:', err);
        this.error = 'Error al cargar la configuración del juego';
        this.loading = false;
        this.gameLoadingService.hideFast();
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
        this.userAssessed = true;
      }
    } catch (error) {
      console.error('Error al mostrar modal de valoración:', error);
    }
  }

  async initializeGame() {
    this.cards = [];
    this.flippedCards = [];
    this.matches = 0;
    this.gameStarted = false;
    this.gameCompleted = false;
    this.timer = 0;
    this.attempts = 0; 

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Si no hay configuración del juego, mostrar error
    if (!this.gameConfig || !this.gameConfig.memory_pairs || this.gameConfig.memory_pairs.length === 0) {
      this.error = 'No hay configuración del juego disponible';
      return;
    }

    // Crear cartas desde la configuración del juego (ahora es async)
    await this.createCardsFromConfiguration();

    // Mezclar las cartas
    this.shuffleCards();
    
    // Forzar la recarga de imágenes
    this.forceImageReload();
  }

  private async createCardsFromConfiguration() {
    if (!this.gameConfig?.memory_pairs) return;

    let id = 0;
    const mode = this.gameConfig.memory_pairs[0]?.mode || 'II';

    for (const [index, pair] of this.gameConfig.memory_pairs.entries()) {
      if (mode === 'II') {
        const pairName = `pair_${index}`;
        
        if (pair.path_image1) {
          const imagePath = this.convertToWebPath(pair.path_image1);
          const isValid = await this.validateImage(imagePath);
          
          if (isValid) {
            this.cards.push({
              id: id++,
              image: imagePath,
              name: pairName,
              flipped: false,
              matched: false,
              isImageCard: true
            });
          } else {
            console.warn(`Imagen 1 no válida para el par ${index}:`, pair.path_image1);
          }
        }
        
        if (pair.path_image2) {
          const imagePath = this.convertToWebPath(pair.path_image2);
          const isValid = await this.validateImage(imagePath);
          
          if (isValid) {
            this.cards.push({
              id: id++,
              image: imagePath,
              name: pairName,
              flipped: false,
              matched: false,
              isImageCard: true
            });
          } else {
            console.warn(`Imagen 2 no válida para el par ${index}:`, pair.path_image2);
          }
        }
      } else if (mode === 'ID') {
        // Modo Imagen-Descripción: crear una carta con imagen y una con texto
        if (pair.path_image1) {
          const imagePath = this.convertToWebPath(pair.path_image1);
          const isValid = await this.validateImage(imagePath);
          
          if (isValid) {
            this.cards.push({
              id: id++,
              image: imagePath,
              name: `pair_${index}`,
              flipped: false,
              matched: false,
              isImageCard: true
            });
          } else {
            console.warn(`Imagen no válida para el par ${index}:`, pair.path_image1);
          }
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
    }

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
        
        // Mostrar modal de valoración si el usuario no ha evaluado el juego
        if (!this.userAssessed && this.gameConfig && !this.gameConfig.assessed) {
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
    // Hacer la inicialización async
    this.initializeGame().then(() => {
    }).catch((error) => {
      console.error('Error reiniciando juego:', error);
      this.error = 'Error al reiniciar el juego';
    });
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
    return this.gameConfig?.game_name || 'Juego de Memoria';
  }

  get descripcionJuego(): string {
    return this.gameConfig?.game_description || 'Encuentra todas las parejas para completar el juego';
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
    return this.gameConfig?.game_description || 'Memoriza la posición de las cartas cuando se muestren al inicio. Luego encuentra las parejas haciendo clic en las cartas.';
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
    // Asignar imagen por defecto en caso de error
    card.image = 'assets/default-game.png';
  }

  /**
   * Convierte una ruta absoluta del sistema de archivos a una ruta web válida con cache busting
   * @param absolutePath Ruta absoluta del sistema (ej: C:\Users\...\public\storage\memory\imagen.jpg)
   * @returns Ruta web relativa con timestamp para evitar cache (ej: storage/memory/imagen.jpg?t=12345)
   */
  private convertToWebPath(absolutePath: string): string {
    if (!absolutePath) return '';
    
    let webPath = '';
    
    // Buscar la parte "storage" en la ruta
    const storageIndex = absolutePath.indexOf('storage');
    if (storageIndex !== -1) {
      // Extraer desde "storage" hasta el final y normalizar las barras
      webPath = absolutePath.substring(storageIndex).replace(/\\/g, '/');
    } else {
      // Si no encuentra "storage", buscar "public" y extraer desde ahí
      const publicIndex = absolutePath.indexOf('public');
      if (publicIndex !== -1) {
        const pathFromPublic = absolutePath.substring(publicIndex + 7); // +7 para saltar "public/"
        webPath = pathFromPublic.replace(/\\/g, '/');
      } else {
        // Como último recurso, intentar extraer solo el nombre del archivo
        const fileName = absolutePath.split(/[\\\/]/).pop();
        webPath = `storage/memory/${fileName || ''}`;
      }
    }
    
    // Agregar cache busting para forzar la recarga de imágenes nuevas
    const timestamp = Date.now();
    const separator = webPath.includes('?') ? '&' : '?';
    return `${webPath}${separator}t=${timestamp}`;
  }

  /**
   * Valida que una imagen sea accesible antes de usarla
   * @param imagePath Ruta de la imagen a validar
   * @returns Promise que resuelve true si la imagen es accesible
   */
  private validateImage(imagePath: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => {
        console.warn(`Imagen no encontrada: ${imagePath}`);
        resolve(false);
      };
      img.src = imagePath;
    });
  }

  /**
   * Fuerza la recarga de todas las imágenes del juego
   */
  private forceImageReload(): void {
    setTimeout(() => {
      this.cards.forEach(card => {
        if (card.isImageCard && card.image) {
          // Verificar que la imagen se puede cargar
          this.validateImage(card.image).then(isValid => {
            if (!isValid) {
              console.warn(`Reintentando carga de imagen: ${card.image}`);
              // Forzar recarga con nuevo timestamp
              const baseUrl = card.image.split('?')[0];
              card.image = `${baseUrl}?t=${Date.now()}`;
            }
          });
        }
      });
    }, 500); // Esperar un poco para que se rendericen las cartas
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
