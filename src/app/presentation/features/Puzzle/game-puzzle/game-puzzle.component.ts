import { Component, OnInit, OnDestroy, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameConfigurationService } from '../../../../core/infrastructure/api/game-configuration.service';
import { GameConfiguration, PuzzleConfig } from '../../../../core/domain/model/game-configuration.model';
import { BaseAuthenticatedComponent } from '../../../../core/presentation/shared/base-authenticated.component';
import { GameAlertService, GameAlertConfig } from '../../../../core/infrastructure/service/game-alert.service';
import { GameAudioService } from '../../../../core/infrastructure/service/game-audio.service';
import { RatingModalService } from '../../../../core/infrastructure/service/rating-modal.service';
import { GameUrlService } from '../../../../core/infrastructure/service/game-url.service';
import { GameLoadingService } from '../../../../core/infrastructure/service/game-loading.service';
import { FloatingLogoComponent } from '../../../components/floating-logo/floating-logo.component';
import { GameHeaderComponent } from '../../../components/game-header/game-header.component';
import { PuzzleLoadingStateComponent } from './components/puzzle-loading-state/puzzle-loading-state.component';
import { PuzzleErrorStateComponent } from './components/puzzle-error-state/puzzle-error-state.component';
import { PuzzleClueComponent } from './components/puzzle-clue/puzzle-clue.component';
import { PuzzleSidebarComponent } from './components/puzzle-sidebar/puzzle-sidebar.component';
import { PuzzleBoardComponent } from './components/puzzle-board/puzzle-board.component';
import { PuzzleStartScreenComponent } from './components/puzzle-start-screen/puzzle-start-screen.component';

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
  imports: [CommonModule, FloatingLogoComponent, GameHeaderComponent ,
    PuzzleLoadingStateComponent, PuzzleErrorStateComponent, PuzzleClueComponent,
    PuzzleSidebarComponent, PuzzleBoardComponent, PuzzleStartScreenComponent ],
  templateUrl: './game-puzzle.component.html',
  styleUrl: './game-puzzle.component.css',
})
export class GamePuzzleComponent
  extends BaseAuthenticatedComponent
  implements OnInit, OnDestroy
{
  @Input() withProgrammings: boolean = false;

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
  backgroundColor: string = '#f3f4f6';
  fontColor: string = '#222';
  fontFamily: string = 'Arial';
  timeLimit: number = 300;
  isMobileView = false;
  isFooterCollapsed = false; // Estado del footer móvil
  private timeWarningSent = false;
  juegoIniciado = false;
  constructor() {
    super();
  }

  override ngOnInit() {
    super.ngOnInit();
    this.juegoIniciado = false;
    this.checkViewport();
    window.addEventListener('resize', () => {
      this.checkViewport();
    });
  }

  private checkViewport() {
    const wasMainView = !this.isMobileView;
    this.isMobileView = window.innerWidth < 1024; // Tablet o móvil
    
    if (this.isMobileView) {
      this.isPanelOpen = true; // SIEMPRE abierto en móviles (footer fijo)
      this.isFooterCollapsed = false; // Footer siempre visible en móviles
    } else {
      this.isPanelOpen = true; // Por defecto abierto en desktop
      this.isFooterCollapsed = false; // No aplicable en desktop
    }

    // Si tenemos las dimensiones de la imagen, recalcular el tablero
    if (this.actualImageWidth && this.actualImageHeight) {
      const boardSize = this.getBoardSize();
      this.imageWidth = boardSize.width;
      this.imageHeight = boardSize.height;
    }
  }
  getBoardSize(): { width: number; height: number } {
    // Si tenemos las dimensiones reales de la imagen, usarlas como base
    if (this.actualImageWidth && this.actualImageHeight) {
      const imgAspectRatio = this.actualImageWidth / this.actualImageHeight;
      
      if (this.isMobileView) {
        // Móviles: ajustar al viewport disponible, dejando espacio para el footer de piezas
        const availableWidth = window.innerWidth * 0.90;
        const availableHeight = (window.innerHeight - 200) * 0.75; // Espacio para header y footer de piezas
        
        let boardWidth, boardHeight;
        
        if (imgAspectRatio > 1) {
          // Imagen horizontal: limitar por ancho
          boardWidth = Math.min(availableWidth, 350); // Tamaño optimizado para móviles
          boardHeight = boardWidth / imgAspectRatio;
        } else {
          // Imagen vertical: limitar por alto
          boardHeight = Math.min(availableHeight, 350); // Tamaño optimizado para móviles
          boardWidth = boardHeight * imgAspectRatio;
        }
        
        // Asegurar tamaños mínimos apropiados para móviles
        boardWidth = Math.max(boardWidth, 200);
        boardHeight = Math.max(boardHeight, 200);
        
        return { width: Math.round(boardWidth), height: Math.round(boardHeight) };
        
      } else if (window.innerWidth < 1280) {
        // Tablets: tamaño intermedio adaptativo
        const maxSize = 600;
        let boardWidth, boardHeight;
        
        if (imgAspectRatio > 1) {
          boardWidth = maxSize;
          boardHeight = maxSize / imgAspectRatio;
        } else {
          boardHeight = maxSize;
          boardWidth = maxSize * imgAspectRatio;
        }
        
        return { width: Math.round(boardWidth), height: Math.round(boardHeight) };
        
      } else {
        // Desktop: tamaño grande adaptativo
        const maxSize = 700;
        let boardWidth, boardHeight;
        
        if (imgAspectRatio > 1) {
          boardWidth = maxSize;
          boardHeight = maxSize / imgAspectRatio;
        } else {
          boardHeight = maxSize;
          boardWidth = maxSize * imgAspectRatio;
        }
        
        return { width: Math.round(boardWidth), height: Math.round(boardHeight) };
      }
    }
    
    // Fallback si no tenemos dimensiones de imagen
    if (this.isMobileView) {
      return { width: 350, height: 350 };
    } else if (window.innerWidth < 1280) {
      return { width: 600, height: 600 };
    } else {
      return { width: 700, height: 700 };
    }
  }
  // ...existing code...
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

    // Aplicar settings visuales y tiempo
    if (data.settings && Array.isArray(data.settings)) {
      for (const setting of data.settings) {
        if (setting.key === 'backgroundColor' && setting.value) {
          this.backgroundColor = setting.value;
        }
        if (setting.key === 'fontColor' && setting.value) {
          this.fontColor = setting.value;
        }
        if (setting.key === 'font' && setting.value) {
          this.fontFamily = setting.value;
        }
        if (setting.key === 'time_limit' && setting.value) {
          const parsed = parseInt(setting.value);
          if (!isNaN(parsed)) {
            this.timeLimit = parsed;
            this.maxTime = parsed;
            this.timeLeft = parsed;
          }
        }
      }
    }

    if (this.puzzleConfig) {
      this.rows = this.puzzleConfig.rows || 4;
      this.cols = this.puzzleConfig.cols || 4;
      this.totalPieces = this.rows * this.cols;
      this.maxTime = this.timeLimit;
      this.timeLeft = this.timeLimit;

      // Configurar tamaños según el dispositivo
      const boardSize = this.getBoardSize();
      this.imageWidth = boardSize.width;
      this.imageHeight = boardSize.height;

      if (this.puzzleConfig.path_img) {
        // Convierte la ruta de la imagen a formato frontend
        this.puzzleImageUrl = this.getFrontendImagePath(this.puzzleConfig.path_img);
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

      // Ahora que tenemos las dimensiones reales, recalcular el tablero
      const boardSize = this.getBoardSize();
      this.imageWidth = boardSize.width;
      this.imageHeight = boardSize.height;
      
      // Calcular la escala basada en las nuevas dimensiones del tablero
      const scaleX = boardSize.width / this.actualImageWidth;
      const scaleY = boardSize.height / this.actualImageHeight;
      this.imageScale = Math.min(scaleX, scaleY);

      console.log('🖼️ Dimensiones de imagen calculadas:', {
        originalWidth: this.actualImageWidth,
        originalHeight: this.actualImageHeight,
        boardWidth: boardSize.width,
        boardHeight: boardSize.height,
        scale: this.imageScale
      });
    };
    img.onerror = () => {
      // Valores por defecto si la imagen no carga
      this.actualImageWidth = 700;
      this.actualImageHeight = 700;
      const boardSize = this.getBoardSize();
      this.imageWidth = boardSize.width;
      this.imageHeight = boardSize.height;
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
    this.juegoIniciado = true;
    this.gameAudioService.playGameStart();
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timeLeft = this.timeLimit;
    this.timeElapsed = 0;
    this.timeWarningSent = false;
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.timeElapsed = this.timeLimit - this.timeLeft;
        if (this.timeLeft === 60 && !this.timeWarningSent) {
          this.gameAudioService.playTimeWarning();
          this.timeWarningSent = true;
        }
        if (this.timeLeft <= 5 && this.timeLeft > 0) {
          this.gameAudioService.playCountdown();
        }
      } else {
        this.timeElapsed = this.timeLimit;
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

  onPieceDoubleClick(piece: PuzzlePiece) {
    if (!this.gameStarted || this.gameCompleted || !piece) return;
    if (piece.inBoard) {
      this.returnToSidebar(piece);
    }
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
    const timeUsed = this.formatTime(this.timeElapsed);
    const config: GameAlertConfig = {
      gameType: 'puzzle',
      gameName: 'Rompecabezas',
      timeUsed,
      userAssessed: this.userAssessed || (this.gameConfig?.assessed ?? false),
    };
    
    let shouldShowAlert = true;
    
    while (shouldShowAlert) {
      const result = await this.gameAlertService.showSuccessAlert(config);
      
      if (result.isConfirmed) {
        // Jugar de nuevo
        this.restartGame();
        shouldShowAlert = false;
      } else if (result.isDenied) {
        // Valorar juego
        await this.showRatingAlert('completed');
        // Actualizar la configuración para que no se muestre nuevamente el botón
        config.userAssessed = true;
        // Continuar el bucle para mostrar el modal nuevamente
      } else {
        // Ir al Dashboard (isDismissed o cualquier otro caso)
        this.volverAlDashboard();
        shouldShowAlert = false;
      }
    }
  }

  private async showTimeUpAlert(): Promise<void> {
    const config: GameAlertConfig = {
      gameType: 'puzzle',
      gameName: 'Rompecabezas',
      userAssessed: this.userAssessed || (this.gameConfig?.assessed ?? false),
    };

    let shouldShowAlert = true;
    
    while (shouldShowAlert) {
      const result = await this.gameAlertService.showTimeUpAlert(config);
      
      if (result.isConfirmed) {
        // Intentar de nuevo
        this.restartGame();
        shouldShowAlert = false;
      } else if (result.isDenied) {
        // Valorar juego
        await this.showRatingAlert('timeup');
        // Actualizar la configuración para que no se muestre nuevamente el botón
        config.userAssessed = true;
        // Continuar el bucle para mostrar el modal nuevamente
      } else {
        // Ir al Dashboard (isDismissed o cualquier otro caso)
        this.volverAlDashboard();
        shouldShowAlert = false;
      }
    }
  }

  private async showRatingAlert(context: 'completed' | 'timeup' | 'general' = 'general'): Promise<void> {
    if (!this.gameConfig || !this.currentUserId) return;

    try {
      const gameInstanceId = this.gameConfig.game_instance_id;
      const gameName = this.gameConfig.game_name || 'Rompecabezas';

      const result = await this.ratingModalService.showRatingModal(
        gameInstanceId,
        this.currentUserId,
        gameName,
        context
      );

      if (result) {
        this.userAssessed = true;
        // Actualizar también la configuración del juego para evitar mostrar nuevamente
        if (this.gameConfig) {
          this.gameConfig.assessed = true;
        }
      }
    } catch (error) {
      console.error('Error al mostrar modal de valoración:', error);
    }
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
    // En móviles, no permitir cerrar el panel (footer fijo)
    if (this.isMobileView) {
      return;
    }
    this.isPanelOpen = !this.isPanelOpen;
    this.gameAudioService.playButtonClick();
  }

  toggleFooter() {
    this.isFooterCollapsed = !this.isFooterCollapsed;
    this.gameAudioService.playButtonClick();
  }

  getPieceStyle(piece: PuzzlePiece): any {
    if (!piece) return {};

    // Obtener dimensiones del tablero (que ahora se adapta a la imagen)
    const boardSize = this.getBoardSize();
    const imageDimensions = this.getImageDimensions();

    // Calcular el tamaño de cada pieza basado en las dimensiones del tablero
    const pieceWidth = boardSize.width / this.cols;
    const pieceHeight = boardSize.height / this.rows;
    const isInBoard = !this.isInSidebar(piece);

    // Factor de escala para el sidebar
    const sidebarScale = this.isMobileView ? 0.45 : 0.55; // Piezas más grandes en sidebar

    // Calcular dimensiones de visualización
    const displayWidth = isInBoard ? pieceWidth : pieceWidth * sidebarScale;
    const displayHeight = isInBoard ? pieceHeight : pieceHeight * sidebarScale;

    // Calcular posición de fondo para mostrar solo la porción correcta de la imagen
    const bgPosX = -piece.col * pieceWidth;
    const bgPosY = -piece.row * pieceHeight;

    // Escalar la posición para piezas del sidebar
    const scaledBgPosX = isInBoard ? bgPosX : bgPosX * sidebarScale;
    const scaledBgPosY = isInBoard ? bgPosY : bgPosY * sidebarScale;

    // Tamaño del background (imagen completa)
    const bgSizeWidth = isInBoard
      ? boardSize.width
      : boardSize.width * sidebarScale;
    const bgSizeHeight = isInBoard
      ? boardSize.height
      : boardSize.height * sidebarScale;

    // Estilos visuales
    let border = isInBoard ? 'none' : '2px solid rgba(147, 51, 234, 0.3)';
    let boxShadow = isInBoard ? 'none' : '0 2px 8px rgba(147, 51, 234, 0.1)';
    let borderRadius = isInBoard ? '0' : '8px';

    if (this.selectedPiece?.id === piece.id) {
      border = '2px solid #9333EA';
      boxShadow = '0 0 0 2px #9333EA, 0 4px 12px rgba(147, 51, 234, 0.3)';
    }

    if (piece.correctPos && isInBoard) {
      border = '1px solid #22c55e';
      boxShadow = '0 0 0 1px #22c55e';
    }

    return {
      'width.px': Math.round(displayWidth),
      'height.px': Math.round(displayHeight),
      'background-image': `url('${this.puzzleImageUrl}')`,
      'background-position': `${Math.round(scaledBgPosX)}px ${Math.round(scaledBgPosY)}px`,
      'background-size': `${Math.round(bgSizeWidth)}px ${Math.round(bgSizeHeight)}px`,
      'background-repeat': 'no-repeat',
      border: border,
      'border-radius': borderRadius,
      'box-shadow': boxShadow,
      cursor: this.gameStarted && !this.gameCompleted ? 'grab' : 'default',
      display: 'block',
      position: isInBoard ? 'absolute' : 'relative',
      'box-sizing': 'border-box',
      transition: 'all 0.2s ease',
      transform: this.selectedPiece?.id === piece.id ? 'scale(1.02)' : 'scale(1)',
      top: isInBoard ? '0' : 'auto',
      left: isInBoard ? '0' : 'auto',
      margin: isInBoard ? '0' : '4px',
      padding: '0',
      overflow: 'hidden',
      'flex-shrink': '0',
      'image-rendering': 'high-quality'
    };
  }

  // Método para obtener estilos cuando el juego está completado
  getPieceStyleCompleted(piece: PuzzlePiece): any {
    if (!piece) return {};

    // Usar las dimensiones del tablero (que ahora se adapta a la imagen)
    const boardSize = this.getBoardSize();
    const pieceWidth = boardSize.width / this.cols;
    const pieceHeight = boardSize.height / this.rows;
    const isInBoard = !this.isInSidebar(piece);

    // Para el sidebar, mantener el mismo scale que en el juego normal
    const sidebarScale = this.isMobileView ? 0.45 : 0.55;
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
      ? boardSize.width
      : boardSize.width * sidebarScale;
    const backgroundSizeHeight = isInBoard
      ? boardSize.height
      : boardSize.height * sidebarScale;

    return {
      'width.px': Math.round(displayWidth),
      'height.px': Math.round(displayHeight),
      'background-image': `url('${this.puzzleImageUrl}')`,
      'background-position': `${Math.round(scaledBackgroundPosX)}px ${Math.round(scaledBackgroundPosY)}px`,
      'background-size': `${Math.round(backgroundSizeWidth)}px ${Math.round(backgroundSizeHeight)}px`,
      'background-repeat': 'no-repeat',
      border: 'none',
      'border-radius': isInBoard ? '0' : '8px',
      'box-shadow': 'none',
      cursor: 'default',
      display: 'block',
      position: isInBoard ? 'absolute' : 'relative',
      'box-sizing': 'border-box',
      transition: 'all 0.2s ease',
      transform: 'scale(1)',
      top: isInBoard ? '0' : 'auto',
      left: isInBoard ? '0' : 'auto',
      margin: isInBoard ? '0' : '4px',
      padding: '0',
      overflow: 'hidden',
      'flex-shrink': '0',
      'image-rendering': 'high-quality'
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

    // Mostrar alerta de tiempo agotado (que incluye la opción de valorar)
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

  /**
   * Devuelve las dimensiones exactas que debe tener la imagen en el tablero
   * (que ahora coinciden con el tamaño del tablero)
   */
  private getImageDimensions(): { width: number; height: number } {
    const boardSize = this.getBoardSize();
    return { width: boardSize.width, height: boardSize.height };
  }
}
