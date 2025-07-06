import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameConfigurationService } from '../../../../core/infrastructure/api/game-configuration.service';
import {
  GameConfiguration,
  PuzzleConfig,
} from '../../../../core/domain/model/game-configuration.model';
import { BaseAuthenticatedComponent } from '../../../../core/presentation/shared/base-authenticated.component';
import {
  GameAlertService,
  GameAlertConfig,
} from '../../../../core/infrastructure/service/game-alert.service';
import { GameAudioService } from '../../../../core/infrastructure/service/game-audio.service';
import { RatingModalService } from '../../../../core/infrastructure/service/rating-modal.service';
import { GameUrlService } from '../../../../core/infrastructure/services/game-url.service';
import { GameLoadingService } from '../../../../core/infrastructure/services/game-loading.service';
import { FloatingLogoComponent } from '../../../components/floating-logo/floating-logo.component';
import { GameHeaderComponent } from '../../../components/game-header/game-header.component';

interface PuzzlePiece {
  id: number;
  row: number;
  col: number;
  currentRow: number;
  currentCol: number;
  inBoard: boolean;
  correctPos: boolean;
  // Propiedades para las formas
  topConnector: 'in' | 'out' | 'none';
  rightConnector: 'in' | 'out' | 'none';
  bottomConnector: 'in' | 'out' | 'none';
  leftConnector: 'in' | 'out' | 'none';
}

@Component({
  selector: 'app-game-puzzle',
  standalone: true,
  imports: [CommonModule, FloatingLogoComponent, GameHeaderComponent],
  templateUrl: './game-puzzle.component.html',
  styleUrl: './game-puzzle.component.css',
})
export class GamePuzzleComponent
  extends BaseAuthenticatedComponent
  implements OnInit, OnDestroy
{
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameConfigService = inject(GameConfigurationService);
  private gameAlertService = inject(GameAlertService);
  private gameAudioService = inject(GameAudioService);
  private ratingModalService = inject(RatingModalService);
  private gameUrlService = inject(GameUrlService);
  private gameLoadingService = inject(GameLoadingService);
  pieces: PuzzlePiece[] = [];
  rows = 4;
  cols = 4;
  totalPieces = this.rows * this.cols;
  gameStarted = false;
  gameCompleted = false;
  draggedPiece: PuzzlePiece | null = null;
  correctPieces = 0;
  timeElapsed = 0;
  timer: any;
  allowWrongPlacements = false;
  maxTime = 300;
  timeLeft = this.maxTime;
  imageWidth = 700;
  imageHeight = 700;
  actualImageWidth = 0;
  actualImageHeight = 0;
  imageScale = 1;
  sidebarWidth = 200;
  loading = false;
  error: string | null = null;
  gameConfig: GameConfiguration | null = null;
  puzzleConfig: PuzzleConfig | null = null;
  userAssessed = false;
  puzzleImageUrl = 'assets/pedrito.jpg';
  selectedPiece: PuzzlePiece | null = null;
  isPanelOpen = true;
  hasUserAssessed = false;
  headerExpanded = false;
  mostrarPista = false;
  mobileMenuOpen = false;
  isMobileView = false;
  private timeWarningSent = false;

  constructor() {
    super();
  }

  override ngOnInit() {
    super.ngOnInit();
    this.checkViewport();
    window.addEventListener('resize', () => this.checkViewport());
  }

  private checkViewport() {
    this.isMobileView = window.innerWidth < 1024; // Tablet o móvil
    if (this.isMobileView) {
      this.isPanelOpen = false; // Por defecto cerrado en móviles
    } else {
      this.isPanelOpen = true; // Por defecto abierto en desktop
    }
  }
  getBoardSize(): { width: number; height: number } {
    if (this.isMobileView) {
      const maxWidth = window.innerWidth * 0.95;
      return { width: maxWidth, height: maxWidth }; // Cuadrado
    } else if (window.innerWidth < 1280) {
      // Tablet
      const maxWidth = Math.min(600, window.innerWidth * 0.8);
      return { width: maxWidth, height: maxWidth };
    } else {
      // Desktop
      return { width: 724, height: 724 }; // Tamaño original
    }
  }
  override ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    super.ngOnDestroy();
  }

  onAuthenticationReady(userId: number): void {
    // Mostrar loading rápido para el puzzle
    this.gameLoadingService.showFastGameLoading('Cargando Rompecabezas...');
    
    // Capturar parámetros de ruta - puede ser 'id' o 'token'
    const id = this.route.snapshot.params['id'];
    const token = this.route.snapshot.params['token'];

    console.log('🧩 [Puzzle] Parámetros capturados:', {
      id,
      token,
      url: this.router.url,
    });

    if (token) {
      // Si tenemos un token, validarlo primero
      console.log('🔐 [Puzzle] Validando token de acceso...');
      this.gameUrlService.validateGameToken(token).subscribe({
        next: (response) => {
          if (response.valid && response.gameInstanceId) {
            console.log(
              '✅ [Puzzle] Token válido, cargando juego con ID:',
              response.gameInstanceId
            );
            this.cargarConfiguracionJuego(response.gameInstanceId);
          } else {
            console.error('❌ [Puzzle] Token inválido o expirado');
            this.error = 'El enlace del juego ha expirado o no es válido';
            this.loading = false;
            this.gameLoadingService.hideFast();
          }
        },
        error: (error) => {
          console.error('❌ [Puzzle] Error validando token:', error);
          this.error = 'Error al validar el acceso al juego';
          this.loading = false;
          this.gameLoadingService.hideFast();
        },
      });
    } else if (id) {
      // Si tenemos un ID tradicional, usarlo directamente
      const gameId = Number(id);
      if (gameId && !isNaN(gameId)) {
        console.log('🧩 [Puzzle] Cargando juego con ID tradicional:', gameId);
        this.cargarConfiguracionJuego(gameId);
      } else {
        console.error('❌ [Puzzle] ID de juego inválido:', id);
        this.error = 'ID de juego inválido';
        this.loading = false;
        this.gameLoadingService.hideFast();
      }
    } else {
      console.log(
        '🧩 [Puzzle] Sin parámetros específicos, iniciando juego por defecto'
      );
      this.gameLoadingService.hideFast();
      this.startGame();
    }
  }

  private cargarConfiguracionJuego(id: number): void {
    this.loading = true;
    this.error = null;

    // Get userId from authenticated user
    const userId = this.currentUserId;

    this.gameConfigService
      .getGameConfiguration(id, userId || undefined, false)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.aplicarConfiguracion(response.data);
            this.iniciarJuego();
            this.gameLoadingService.hideFast();
          } else {
            this.error = 'Error al cargar la configuración del juego';
            this.loading = false;
            this.gameLoadingService.hideFast();
            // Usar imagen por defecto
            this.puzzleImageUrl = 'assets/rompecabezas.png';
            this.startGame();
          }
        },
        error: (err) => {
          console.error('Error loading game config:', err);
          this.error = 'Error al cargar la configuración del juego';
          this.loading = false;
          this.gameLoadingService.hideFast();
          // Usar imagen por defecto
          this.puzzleImageUrl = 'assets/rompecabezas.png';
          this.startGame();
        },
      });
  }

  private aplicarConfiguracion(data: GameConfiguration): void {
    this.gameConfig = data;
    this.puzzleConfig = data.puzzle;
    this.userAssessed = data.assessed || false;

    if (this.puzzleConfig) {
      this.rows = this.puzzleConfig.rows || 4;
      this.cols = this.puzzleConfig.cols || 4;
      this.totalPieces = this.rows * this.cols;
      this.maxTime = 300;

      this.imageWidth = 700;
      this.imageHeight = 700;

      if (this.puzzleConfig.path_img) {
        this.puzzleImageUrl = this.getFrontendImagePath(
          this.puzzleConfig.path_img
        );
        // Validar que la imagen sea accesible
        this.validatePuzzleImage(this.puzzleImageUrl).then((isValid) => {
          if (!isValid) {
            console.warn(
              'Imagen del puzzle no accesible, usando imagen por defecto'
            );
            this.puzzleImageUrl = 'assets/rompecabezas.png';
          }
        });
      } else {
        this.puzzleImageUrl = 'assets/rompecabezas.png';
      }

      this.allowWrongPlacements = !this.puzzleConfig.automatic_help;
    }

    this.iniciarJuego();

    // Forzar la recarga de imagen del puzzle
    this.forceImageReloadPuzzle();
  }

  private calculateImageDimensions(): void {
    const img = new Image();
    img.onload = () => {
      this.actualImageWidth = img.naturalWidth;
      this.actualImageHeight = img.naturalHeight;

      const maxWidth = 700;
      const maxHeight = 700;
      const scaleX = maxWidth / this.actualImageWidth;
      const scaleY = maxHeight / this.actualImageHeight;
      this.imageScale = Math.min(scaleX, scaleY);

      const scaledWidth = this.actualImageWidth * this.imageScale;
      const scaledHeight = this.actualImageHeight * this.imageScale;

      this.imageWidth = scaledWidth;
      this.imageHeight = scaledHeight;
    };
    img.onerror = () => {
      this.imageWidth = 700;
      this.imageHeight = 700;
      this.actualImageWidth = 700;
      this.actualImageHeight = 700;
      this.imageScale = 1;
    };
    img.src = this.puzzleImageUrl;
  }

  private iniciarJuego(): void {
    this.loading = false;
    // Esperar un poco antes de iniciar para asegurar que la imagen se cargue
    setTimeout(() => {
      this.startGame();
    }, 100);
  }

  getFrontendImagePath(path: string): string {
    if (!path) {
      console.warn('Path de imagen vacío, usando imagen por defecto');
      return 'assets/rompecabezas.png';
    }

    // Normalizar el path reemplazando barras invertidas por barras normales
    const normalized = path.replace(/\\/g, '/');

    let webPath = '';

    // Buscar el índice de 'public/storage' en la ruta normalizada
    let publicIndex = normalized.toLowerCase().indexOf('public/storage/');

    if (publicIndex !== -1) {
      // Extraer la parte después de 'public/' (storage/puzzle/...)
      webPath = normalized.substring(publicIndex + 7); // +7 para omitir 'public/'
    } else {
      // Si no encuentra 'public/storage', buscar solo 'storage/'
      const storageIndex = normalized.toLowerCase().indexOf('storage/');
      if (storageIndex !== -1) {
        webPath = normalized.substring(storageIndex);
      } else {
        // Buscar específicamente 'puzzle/' como patrón alternativo
        const puzzleIndex = normalized.toLowerCase().indexOf('puzzle/');
        if (puzzleIndex !== -1) {
          // Extraer desde 'storage/' si existe, o construir la ruta
          let startIndex = normalized
            .toLowerCase()
            .lastIndexOf('storage/', puzzleIndex);
          if (startIndex === -1) {
            startIndex = puzzleIndex;
          }
          const relativePath = normalized.substring(startIndex);
          webPath = relativePath.startsWith('storage/')
            ? relativePath
            : `storage/puzzle/${normalized.substring(puzzleIndex + 7)}`;
        } else {
          // Como último recurso, usar imagen por defecto
          console.warn(
            'No se pudo procesar la ruta de imagen, usando imagen por defecto. Path:',
            path
          );
          return 'assets/rompecabezas.png';
        }
      }
    }

    // Agregar cache busting para forzar la recarga de imágenes nuevas
    const timestamp = Date.now();
    const separator = webPath.includes('?') ? '&' : '?';
    const finalPath = `${webPath}${separator}t=${timestamp}`;

    return finalPath;
  }

  generatePuzzleShapes() {
    this.pieces.forEach((piece) => {
      piece.topConnector = piece.row === 0 ? 'none' : 'none';
      piece.rightConnector = piece.col === this.cols - 1 ? 'none' : 'none';
      piece.bottomConnector = piece.row === this.rows - 1 ? 'none' : 'none';
      piece.leftConnector = piece.col === 0 ? 'none' : 'none';
    });

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const piece = this.pieces.find((p) => p.row === row && p.col === col);
        if (!piece) continue;

        // Conector derecho (solo si no es la última columna)
        if (col < this.cols - 1) {
          const rightPiece = this.pieces.find(
            (p) => p.row === row && p.col === col + 1
          );
          if (
            rightPiece &&
            piece.rightConnector === 'none' &&
            rightPiece.leftConnector === 'none'
          ) {
            const isOut = Math.random() > 0.5;
            piece.rightConnector = isOut ? 'out' : 'in';
            rightPiece.leftConnector = isOut ? 'in' : 'out';
          }
        }

        // Conector inferior (solo si no es la última fila)
        if (row < this.rows - 1) {
          const bottomPiece = this.pieces.find(
            (p) => p.row === row + 1 && p.col === col
          );
          if (
            bottomPiece &&
            piece.bottomConnector === 'none' &&
            bottomPiece.topConnector === 'none'
          ) {
            const isOut = Math.random() > 0.5;
            piece.bottomConnector = isOut ? 'out' : 'in';
            bottomPiece.topConnector = isOut ? 'in' : 'out';
          }
        }
      }
    }
  }

  initializePuzzle() {
    this.pieces = [];
    this.correctPieces = 0;

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const id = i * this.cols + j;
        this.pieces.push({
          id,
          row: i,
          col: j,
          currentRow: -1,
          currentCol: -1,
          inBoard: false,
          correctPos: false,
          // Inicializar conectores
          topConnector: 'none',
          rightConnector: 'none',
          bottomConnector: 'none',
          leftConnector: 'none',
        });
      }
    }

    // Generar las formas del puzzle
    this.generatePuzzleShapes();

    // Mezclar las piezas en el sidebar
    this.shufflePiecesForSidebar();

    this.gameCompleted = false;
  }

  getPuzzleShapeClasses(piece: PuzzlePiece): string {
    return 'puzzle-piece';
  }

  async startGame() {
    this.gameAudioService.playGameStart();

    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timeLeft = this.maxTime;
    this.timeElapsed = 0;
    this.timeWarningSent = false;

    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.timeElapsed = this.maxTime - this.timeLeft; // Actualizar tiempo transcurrido

        // Reproducir sonido de advertencia cuando quedan 60 segundos
        if (this.timeLeft === 60 && !this.timeWarningSent) {
          this.gameAudioService.playTimeWarning();
          this.timeWarningSent = true;
        }

        // Reproducir countdown en los últimos 5 segundos
        if (this.timeLeft <= 5 && this.timeLeft > 0) {
          this.gameAudioService.playCountdown();
        }
      } else {
        this.timeElapsed = this.maxTime; // Tiempo total transcurrido cuando se agota
        this.gameAudioService.playTimeUp();
        clearInterval(this.timer);
        this.endGame();
      }
    }, 1000);

    // Validar y cargar la imagen antes de inicializar el puzzle
    try {
      const isValidImage = await this.validateImageUrl();
      if (!isValidImage) {
        console.warn('⚠️ Imagen no válida, cambiando a imagen por defecto');
        this.puzzleImageUrl = 'assets/rompecabezas.png';
      }

      // Cargar la imagen y calcular dimensiones
      await this.loadImage();

      // Calcular las dimensiones correctas de la imagen
      this.calculateImageDimensions();

      // Esperar un poco para que se calculen las dimensiones
      setTimeout(() => {
        this.initializePuzzle();
        this.gameStarted = true;
        this.gameCompleted = false;

        // Debug adicional
        this.debugImageInfo();

        // Test visual del puzzle
        this.testPuzzleVisualization();
      }, 300); // Aumenté el tiempo para asegurar que todo se cargue
    } catch (error) {
      console.error('❌ Error al cargar imagen:', error);
      this.puzzleImageUrl = 'assets/rompecabezas.png';
      await this.loadImage();
      this.calculateImageDimensions();

      setTimeout(() => {
        this.initializePuzzle();
        this.gameStarted = true;
        this.gameCompleted = false;
        this.debugImageInfo();
      }, 300);
    }
  }

  shufflePiecesForSidebar() {
    this.gameAudioService.playPuzzleShuffle();
    // Mezclar las piezas usando Fisher-Yates shuffle
    for (let i = this.pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.pieces[i], this.pieces[j]] = [this.pieces[j], this.pieces[i]];
    }

    // Todas las piezas estarán en el sidebar
    this.pieces.forEach((piece) => {
      piece.inBoard = false;
      piece.currentRow = -1;
      piece.currentCol = -1;
      piece.correctPos = false;
    });

    this.correctPieces = 0;
  }

  onPieceClick(piece: PuzzlePiece) {
    if (!this.gameStarted || this.gameCompleted || !piece) return;
    this.selectedPiece = piece;
  }

  onDragStart(piece: PuzzlePiece, event: DragEvent) {
    if (!this.gameStarted || this.gameCompleted || !piece) return;

    this.draggedPiece = piece;
    this.selectedPiece = piece;

    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', piece.id.toString());
      event.dataTransfer.effectAllowed = 'move';
    }

    // Añadir clase visual durante el arrastre
    const target = event.target as HTMLElement;
    if (target) {
      target.style.opacity = '0.7';
    }
  }

  onDragEnd(event: DragEvent) {
    // Restaurar opacidad
    const target = event.target as HTMLElement;
    if (target) {
      target.style.opacity = '1';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDrop(targetRow: number, targetCol: number, event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.draggedPiece || !this.gameStarted || this.gameCompleted) return;

    // Verificar si la casilla ya está ocupada
    const existingPiece = this.getPieceAt(targetRow, targetCol);
    if (existingPiece && existingPiece.id !== this.draggedPiece.id) {
      this.draggedPiece = null;
      return;
    }

    const isCorrectPosition =
      this.draggedPiece.row === targetRow &&
      this.draggedPiece.col === targetCol;

    // Si no permitimos colocaciones incorrectas y la posición no es correcta
    if (!this.allowWrongPlacements && !isCorrectPosition) {
      // Devolver la pieza al sidebar
      this.gameAudioService.playPuzzlePieceWrongPlace();
      this.returnToSidebar(this.draggedPiece);
      return;
    }

    // Si hay una pieza existente (la misma pieza), quitarla primero
    if (existingPiece && existingPiece.id === this.draggedPiece.id) {
      this.returnToSidebar(this.draggedPiece);
      return;
    }

    // Colocar la pieza en el tablero
    this.draggedPiece.inBoard = true;
    this.draggedPiece.currentRow = targetRow;
    this.draggedPiece.currentCol = targetCol;
    this.draggedPiece.correctPos = isCorrectPosition;

    // Reproducir sonido si la pieza está en posición correcta
    if (isCorrectPosition) {
      this.gameAudioService.playPuzzlePieceSnap();
    } else {
      this.gameAudioService.playPuzzlePiecePlace();
    }

    this.updateCorrectPiecesCount();
    this.checkGameCompletion();
    this.draggedPiece = null;
  }

  returnToSidebar(piece: PuzzlePiece) {
    if (!piece) return;

    piece.inBoard = false;
    piece.currentRow = -1;
    piece.currentCol = -1;
    piece.correctPos = false;

    this.updateCorrectPiecesCount();
  }

  updateCorrectPiecesCount() {
    this.correctPieces = this.pieces.filter((p) => p.correctPos).length;
  }

  private loadImage(): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.actualImageWidth = img.naturalWidth;
        this.actualImageHeight = img.naturalHeight;

        // Calcular la escala para mantener proporción
        const scaleX = this.imageWidth / this.actualImageWidth;
        const scaleY = this.imageHeight / this.actualImageHeight;
        this.imageScale = Math.min(scaleX, scaleY);

        console.log('Imagen cargada correctamente:', {
          url: this.puzzleImageUrl,
          originalSize: `${this.actualImageWidth}x${this.actualImageHeight}`,
          targetSize: `${this.imageWidth}x${this.imageHeight}`,
          scale: this.imageScale,
        });
        resolve();
      };
      img.onerror = (error) => {
        console.error(
          'Error al cargar la imagen:',
          error,
          'URL:',
          this.puzzleImageUrl
        );
        this.puzzleImageUrl = 'assets/rompecabezas.png';

        // Intentar cargar la imagen por defecto
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          this.actualImageWidth = fallbackImg.naturalWidth || this.imageWidth;
          this.actualImageHeight =
            fallbackImg.naturalHeight || this.imageHeight;
          this.imageScale = 1;
          resolve();
        };
        fallbackImg.onerror = () => {
          // Si aún falla, usar dimensiones por defecto
          this.actualImageWidth = this.imageWidth;
          this.actualImageHeight = this.imageHeight;
          this.imageScale = 1;
          console.warn(
            'No se pudo cargar ninguna imagen, usando dimensiones por defecto'
          );
          resolve();
        };
        fallbackImg.src = this.puzzleImageUrl;
      };
      img.src = this.puzzleImageUrl;
    });
  }

  checkGameCompletion() {
    if (this.correctPieces === this.totalPieces) {
      this.gameAudioService.playPuzzleComplete();
      this.gameCompleted = true;

      // Actualizar tiempo transcurrido antes de limpiar el timer
      this.timeElapsed = this.maxTime - this.timeLeft;

      if (this.timer) {
        clearInterval(this.timer);
      }
      // Reproducir sonido de juego completado
      this.gameAudioService.playGameComplete();

      // Mostrar modal de éxito (que incluirá el modal de valoración)
      this.showSuccessAlert();
    }
  }

  private async showSuccessAlert(): Promise<void> {
    // Mostrar modal de valoración si el usuario no ha evaluado el juego
    if (!this.userAssessed && this.gameConfig && !this.gameConfig.assessed) {
      await this.showRatingAlert();
    } else {
      console.log('❌ Modal de valoración NO se muestra porque:', {
        userAssessed: this.userAssessed,
        gameAssessed: this.gameConfig?.assessed,
      });
    }

    const timeUsed = this.formatTime(this.timeElapsed);
    const config: GameAlertConfig = {
      gameType: 'puzzle',
      gameName: 'Rompecabezas',
      timeUsed,
    };

    const result = await this.gameAlertService.showSuccessAlert(config);
    if (result.isConfirmed) {
      this.restartGame();
    } else if (result.isDismissed) {
      // Si presiona "Ir al Dashboard" o cierra el modal
      this.volverAlDashboard();
    }
  }

  private async showTimeUpAlert(): Promise<void> {
    // Mostrar modal de valoración si el usuario no ha evaluado el juego
    if (!this.userAssessed && this.gameConfig && !this.gameConfig.assessed) {
      await this.showRatingAlert();
    } else {
      console.log('❌ Modal de valoración NO se muestra porque:', {
        userAssessed: this.userAssessed,
        gameAssessed: this.gameConfig?.assessed,
      });
    }

    const config: GameAlertConfig = {
      gameType: 'puzzle',
      gameName: 'Rompecabezas',
    };

    const result = await this.gameAlertService.showTimeUpAlert(config);
    if (result.isConfirmed) {
      this.restartGame();
    } else if (result.isDismissed) {
      // Si presiona "Ir al Dashboard" o cierra el modal
      this.volverAlDashboard();
    }
  }

  private async showRatingAlert(): Promise<void> {
    if (!this.gameConfig || !this.currentUserId) return;

    try {
      const gameInstanceId = this.gameConfig.game_instance_id;
      const gameName = this.gameConfig.game_name || 'Rompecabezas';

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

  private showRatingModal() {
    // Método legacy - usar showRatingAlert en su lugar
    this.showRatingAlert();
  }

  isPieceAt(row: number, col: number): boolean {
    return this.pieces.some(
      (p) => p.inBoard && p.currentRow === row && p.currentCol === col
    );
  }

  getPieceAt(row: number, col: number): PuzzlePiece | null {
    return (
      this.pieces.find(
        (p) => p.inBoard && p.currentRow === row && p.currentCol === col
      ) || null
    );
  }

  isPieceCorrect(row: number, col: number): boolean {
    const piece = this.getPieceAt(row, col);
    return !!piece?.correctPos;
  }

  isInSidebar(piece: PuzzlePiece): boolean {
    return !piece.inBoard;
  }

  togglePanel() {
    this.isPanelOpen = !this.isPanelOpen;
    this.gameAudioService.playButtonClick();
  }
  getPieceStyle(piece: PuzzlePiece): any {
    if (!piece) return {};

    const pieceWidth = this.imageWidth / this.cols;
    const pieceHeight = this.imageHeight / this.rows;
    const isInBoard = !this.isInSidebar(piece);

    // Para el sidebar, las piezas mantienen las proporciones exactas pero más pequeñas
    const sidebarScale = Math.min(100 / pieceWidth, 100 / pieceHeight); // Máximo 100px por lado
    const displayWidth = isInBoard ? pieceWidth : pieceWidth * sidebarScale;
    const displayHeight = isInBoard ? pieceHeight : pieceHeight * sidebarScale;

    // Calcular la posición de fondo para mostrar solo la porción correcta de la imagen
    const backgroundPosX = -piece.col * pieceWidth;
    const backgroundPosY = -piece.row * pieceHeight;

    // Para el sidebar, escalar también la posición de fondo proporcionalmente
    const scaledBackgroundPosX = isInBoard
      ? backgroundPosX
      : backgroundPosX * sidebarScale;
    const scaledBackgroundPosY = isInBoard
      ? backgroundPosY
      : backgroundPosY * sidebarScale;

    // El background-size debe ser el tamaño COMPLETO de la imagen original escalado apropiadamente
    const backgroundSizeWidth = isInBoard
      ? this.imageWidth
      : this.imageWidth * sidebarScale;
    const backgroundSizeHeight = isInBoard
      ? this.imageHeight
      : this.imageHeight * sidebarScale;

    // Asegurar que la URL de la imagen sea válida
    const imageUrl = this.puzzleImageUrl || 'assets/rompecabezas.png';

    // Determinar el color del borde según el estado de la pieza
    let borderColor;
    let boxShadow = 'none';

    if (piece.correctPos && isInBoard) {
      // Pieza en posición correcta: borde verde
      borderColor = '2px solid #22c55e';
    } else if (this.selectedPiece?.id === piece.id) {
      // Pieza seleccionada: borde morado
      borderColor = isInBoard ? 'none' : '2px solid rgba(147, 51, 234, 0.8)';
      if (!isInBoard) {
        boxShadow = '0 0 0 2px #9333EA, 0 4px 12px rgba(147, 51, 234, 0.2)';
      }
    } else {
      // Pieza normal - sin bordes en el tablero para que las piezas se vean pegadas
      borderColor = isInBoard ? 'none' : '2px solid rgba(147, 51, 234, 0.2)';
      if (!isInBoard) {
        boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      }
    }

    return {
      'width.px': displayWidth,
      'height.px': displayHeight,
      'background-image': `url('${imageUrl}')`,
      'background-position': `${scaledBackgroundPosX}px ${scaledBackgroundPosY}px`,
      'background-size': `${backgroundSizeWidth}px ${backgroundSizeHeight}px`,
      'background-repeat': 'no-repeat',
      'background-clip': 'padding-box',
      cursor: this.gameStarted && !this.gameCompleted ? 'grab' : 'default',
      border: borderColor,
      'border-radius': isInBoard ? '0' : '8px',
      'box-shadow': boxShadow,
      display: 'block',
      position: isInBoard ? 'absolute' : 'relative',
      'box-sizing': 'border-box',
      transition: 'all 0.2s ease',
      transform:
        this.selectedPiece?.id === piece.id ? 'scale(1.05)' : 'scale(1)',
      top: isInBoard ? '0' : 'auto',
      left: isInBoard ? '0' : 'auto',
      margin: isInBoard ? '0' : '6px',
      padding: '0',
      overflow: 'hidden',
    };
  }

  // Método para obtener estilos cuando el juego está completado
  getPieceStyleCompleted(piece: PuzzlePiece): any {
    if (!piece) return {};

    const pieceWidth = this.imageWidth / this.cols;
    const pieceHeight = this.imageHeight / this.rows;
    const isInBoard = !this.isInSidebar(piece);

    // Para el sidebar, mantener el mismo scale que en el juego normal
    const sidebarScale = 0.8;
    const displayWidth = isInBoard ? pieceWidth : pieceWidth * sidebarScale;
    const displayHeight = isInBoard ? pieceHeight : pieceHeight * sidebarScale;

    const backgroundPosX = -piece.col * pieceWidth;
    const backgroundPosY = -piece.row * pieceHeight;
    const scaledBackgroundPosX = isInBoard
      ? backgroundPosX
      : backgroundPosX * sidebarScale;
    const scaledBackgroundPosY = isInBoard
      ? backgroundPosY
      : backgroundPosY * sidebarScale;
    const backgroundSizeWidth = isInBoard
      ? this.imageWidth
      : this.imageWidth * sidebarScale;
    const backgroundSizeHeight = isInBoard
      ? this.imageHeight
      : this.imageHeight * sidebarScale;

    const imageUrl = this.puzzleImageUrl || 'assets/rompecabezas.png';

    return {
      'width.px': displayWidth,
      'height.px': displayHeight,
      'background-image': `url('${imageUrl}')`,
      'background-position': `${scaledBackgroundPosX}px ${scaledBackgroundPosY}px`,
      'background-size': `${backgroundSizeWidth}px ${backgroundSizeHeight}px`,
      'background-repeat': 'no-repeat',
      'background-clip': 'padding-box',
      cursor: 'default',
      border: 'none', // SIN BORDES cuando está completado
      'border-radius': '0',
      'box-shadow': 'none',
      display: 'block',
      position: isInBoard ? 'absolute' : 'relative',
      'box-sizing': 'border-box',
      transition: 'all 0.2s ease',
      transform: 'scale(1)', // Sin transformaciones
      top: isInBoard ? '0' : 'auto',
      left: isInBoard ? '0' : 'auto',
      margin: isInBoard ? '0' : '4px',
      padding: '0',
      overflow: 'hidden',
    };
  }

  // Método para determinar qué estilo usar
  getCurrentPieceStyle(piece: PuzzlePiece): any {
    if (this.gameCompleted) {
      return this.getPieceStyleCompleted(piece);
    }
    return this.getPieceStyle(piece);
  }

  checkImageLoad() {
    const img = new Image();
    img.onload = () => {
      this.calculateImageDimensions();
    };
    img.onerror = (error) => {
      console.error('Error al cargar la imagen:', error);
      console.error('URL que falló:', this.puzzleImageUrl);
      this.puzzleImageUrl = 'assets/rompecabezas.png';
      this.calculateImageDimensions();
    };
    img.src = this.puzzleImageUrl;
  }

  // Nuevo método para validar que la imagen sea accesible
  validateImageUrl(): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(true);
      };
      img.onerror = () => {
        console.error('❌ Error al validar imagen:', this.puzzleImageUrl);
        resolve(false);
      };
      img.src = this.puzzleImageUrl;
    });
  }

  getDropZoneStyle() {
    const pieceWidth = this.imageWidth / this.cols;
    const pieceHeight = this.imageHeight / this.rows;

    return {
      width: `${pieceWidth}px`,
      height: `${pieceHeight}px`,
      'min-width': `${pieceWidth}px`,
      'min-height': `${pieceHeight}px`,
      'max-width': `${pieceWidth}px`,
      'max-height': `${pieceHeight}px`,
      position: 'relative',
      'box-sizing': 'border-box',
      border: '1px dashed rgba(147, 51, 234, 0.2)',
      'background-color': 'rgba(255, 255, 255, 0.1)',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      overflow: 'hidden',
    };
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  toggleHelp() {
    this.allowWrongPlacements = !this.allowWrongPlacements;

    // Si estamos activando la ayuda, verificar las piezas ya colocadas
    if (!this.allowWrongPlacements) {
      this.pieces.forEach((piece) => {
        if (piece.inBoard && !piece.correctPos) {
          this.returnToSidebar(piece);
        }
      });
    }
  }

  endGame() {
    this.gameCompleted = true;
    if (this.timer) {
      clearInterval(this.timer);
    }

    // Mostrar modal de valoración si el usuario no ha evaluado el juego
    if (!this.userAssessed && this.gameConfig && !this.gameConfig.assessed) {
      this.showRatingAlert();
    }

    // Mostrar alerta de tiempo agotado
    this.showTimeUpAlert();
  }

  private restartGame(): void {
    this.timeWarningSent = false;
    this.startGame();
  }

  // Método auxiliar para crear arrays en el template
  createArray(length: number): number[] {
    return Array.from({ length }, (_, i) => i);
  }

  // Array auxiliares para el template
  get rowArray(): number[] {
    return Array(this.rows).fill(0);
  }

  get colArray(): number[] {
    return Array(this.cols).fill(0);
  }

  // Métodos para el header
  toggleHeader(): void {
    this.headerExpanded = !this.headerExpanded;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  get tituloJuego(): string {
    return this.gameConfig?.game_name || 'Rompecabezas';
  }

  get descripcionJuego(): string {
    return (
      this.gameConfig?.game_description ||
      'Completa el rompecabezas colocando todas las piezas en su lugar correcto'
    );
  }

  get porcentajeProgreso(): number {
    return this.totalPieces > 0
      ? Math.round((this.correctPieces / this.totalPieces) * 100)
      : 0;
  }

  // Propiedades adaptadas para el header genérico del puzzle
  get vidasRestantes(): number {
    // En el puzzle no hay vidas, pero podemos mostrar intentos restantes o simplemente 1
    return this.gameCompleted ? 0 : 1;
  }

  get palabrasCompletadas(): number {
    return this.correctPieces;
  }

  get totalPalabras(): number {
    return this.totalPieces;
  }

  get tiempoRestante(): number {
    return this.timeLeft;
  }

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  togglePista(): void {
    this.mostrarPista = !this.mostrarPista;
  }

  get pistaTexto(): string {
    return (
      this.gameConfig?.game_description ||
      'Observa la imagen de referencia y fíjate en los colores y formas para colocar cada pieza en su lugar correcto.'
    );
  }

  // Método para obtener el estilo del contenedor del tablero
  getGameBoardContainerStyle(): any {
    return {
      width: this.imageWidth + 'px',
      height: this.imageHeight + 'px',
    };
  }

  // Método para obtener el estilo del contenedor externo del tablero
  getGameBoardOuterStyle(): any {
    return {
      width: '724px',
      height: '724px',
    };
  }

  // Método auxiliar para debug de imágenes
  debugImageInfo(): void {
    console.log('🖼️ [Puzzle Debug] Image info:', {
      puzzleImageUrl: this.puzzleImageUrl,
      imageWidth: this.imageWidth,
      imageHeight: this.imageHeight,
      actualImageWidth: this.actualImageWidth,
      actualImageHeight: this.actualImageHeight,
      imageScale: this.imageScale,
    });
  }

  // Método para test visual del puzzle
  testPuzzleVisualization(): void {
    console.log('🧩 [Puzzle Test] Visualization test:', {
      rows: this.rows,
      cols: this.cols,
      pieces: this.pieces.length,
      gameStarted: this.gameStarted,
      gameCompleted: this.gameCompleted,
    });
  }

  // Getter para contar piezas restantes en el sidebar
  get remainingPiecesCount(): number {
    return this.pieces.filter((piece) => !piece.inBoard).length;
  }

  protected readonly Array = Array;

  /**
   * Valida que una imagen sea accesible antes de usarla
   * @param imagePath Ruta de la imagen a validar
   * @returns Promise que resuelve true si la imagen es accesible
   */
  private validatePuzzleImage(imagePath: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imagePath;
    });
  }

  /**
   * Fuerza la recarga de la imagen del puzzle si hay problemas
   */
  private forceImageReloadPuzzle(): void {
    // Forzar recarga añadiendo timestamp
    if (this.puzzleImageUrl) {
      const separator = this.puzzleImageUrl.includes('?') ? '&' : '?';
      this.puzzleImageUrl = `${
        this.puzzleImageUrl
      }${separator}reload=${Date.now()}`;
      console.log(
        '🔄 [Puzzle] Forcing image reload with URL:',
        this.puzzleImageUrl
      );
    }
  }
}
