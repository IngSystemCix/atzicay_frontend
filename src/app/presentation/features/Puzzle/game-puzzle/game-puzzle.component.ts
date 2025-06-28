import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameConfigurationService } from '../../../../core/infrastructure/api/game-configuration.service';
import { GameConfiguration, PuzzleConfig } from '../../../../core/domain/model/game-configuration.model';
import { BaseAuthenticatedComponent } from '../../../../core/presentation/shared/base-authenticated.component';
import { RatingService } from '../../../../core/infrastructure/service/rating.service';
import { RatingModalComponent } from '../../../shared/rating-modal/rating-modal.component';
import Swal from 'sweetalert2';

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
  imports: [CommonModule, RatingModalComponent],
  templateUrl: './game-puzzle.component.html',
  styleUrl: './game-puzzle.component.css',
})
export class GamePuzzleComponent extends BaseAuthenticatedComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameConfigService = inject(GameConfigurationService);
  private ratingService = inject(RatingService);
  pieces: PuzzlePiece[] = [];
  rows = 4; // Reducido para mejor jugabilidad
  cols = 4;
  totalPieces = this.rows * this.cols;
  gameStarted = false;
  gameCompleted = false; // Cambiado a false inicialmente
  draggedPiece: PuzzlePiece | null = null;
  correctPieces = 0;
  timeElapsed = 0;
  timer: any;
  allowWrongPlacements = false;
  maxTime = 300;
  timeLeft = this.maxTime;

  // Dimensiones de la imagen
  imageWidth = 600; // Reducido para mejor visualización
  imageHeight = 450;

  // Dimensiones para el área de piezas disponibles
  sidebarWidth = 200;

  // Variables para la configuración del juego
  loading = false;
  error: string | null = null;
  gameConfig: GameConfiguration | null = null;
  puzzleConfig: PuzzleConfig | null = null;

  // URL de la imagen del puzzle
  puzzleImageUrl = 'assets/pedrito.jpg';

  // Variable para seguimiento de piezas seleccionadas
  selectedPiece: PuzzlePiece | null = null;

  // Nueva propiedad para controlar el panel lateral
  isPanelOpen = true;

  // Rating properties
  mostrarModalRating = false;
  gameInstanceId = 0;
  hasUserRated = false;
  headerExpanded: boolean = false;

  constructor() {
    super();
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  override ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    super.ngOnDestroy();
  }

  onAuthenticationReady(userId: number): void {
    const id = Number(this.route.snapshot.params['id']);
    if (id && !isNaN(id)) {
      this.gameInstanceId = id; // Capture game instance ID
      this.cargarConfiguracionJuego(id);
    } else {
      this.startGame();
    }
  }

  private cargarConfiguracionJuego(id: number): void {
    this.loading = true;
    this.error = null;

    this.gameConfigService.getGameConfiguration(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.aplicarConfiguracion(response.data);
          this.iniciarJuego();
        } else {
          this.error = 'Error al cargar la configuración del juego';
          this.loading = false;
          // Usar imagen por defecto
          this.puzzleImageUrl = 'assets/rompecabezas.png';
          this.startGame();
        }
      },
      error: (err) => {
        console.error('Error loading game config:', err);
        this.error = 'Error al cargar la configuración del juego';
        this.loading = false;
        // Usar imagen por defecto
        this.puzzleImageUrl = 'assets/rompecabezas.png';
        this.startGame();
      },
    });
  }

  private aplicarConfiguracion(data: GameConfiguration): void {
    this.gameConfig = data;
    this.puzzleConfig = data.puzzle;
    
    if (this.puzzleConfig) {
      this.rows = this.puzzleConfig.rows || 4;
      this.cols = this.puzzleConfig.cols || 4;
      this.totalPieces = this.rows * this.cols;
      this.maxTime = 300;
      this.imageWidth = 600;
      this.imageHeight = 450;
      
      if (this.puzzleConfig.path_img) {
        this.puzzleImageUrl = this.getFrontendImagePath(this.puzzleConfig.path_img);
      } else {
        this.puzzleImageUrl = 'assets/rompecabezas.png';
      }
      
      this.allowWrongPlacements = !this.puzzleConfig.automatic_help;
    }
  }

  private iniciarJuego(): void {
    this.loading = false;
    // Esperar un poco antes de iniciar para asegurar que la imagen se cargue
    setTimeout(() => {
      this.startGame();
    }, 100);
  }

  getFrontendImagePath(path: string): string {
    // Si la imagen está en public\storage\puzzle, conviértela a una URL relativa accesible
    const normalized = path.replace(/\\/g, '/');
    const publicIndex = normalized.toLowerCase().indexOf('public/storage/');
    const relativePath = normalized.substring(publicIndex + 7); 
      return `/${relativePath}`;
  }

  generatePuzzleShapes() {
    // Primero, inicializar todos los conectores
    this.pieces.forEach((piece) => {
      piece.topConnector = piece.row === 0 ? 'none' : 'none';
      piece.rightConnector = piece.col === this.cols - 1 ? 'none' : 'none';
      piece.bottomConnector = piece.row === this.rows - 1 ? 'none' : 'none';
      piece.leftConnector = piece.col === 0 ? 'none' : 'none';
    });

    // Generar conectores de manera coordinada
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

    // Crear las piezas en su posición correcta inicialmente
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
    const classes = ['puzzle-piece'];

    if (piece.topConnector === 'in') classes.push('top-in');
    else if (piece.topConnector === 'out') classes.push('top-out');

    if (piece.rightConnector === 'in') classes.push('right-in');
    else if (piece.rightConnector === 'out') classes.push('right-out');

    if (piece.bottomConnector === 'in') classes.push('bottom-in');
    else if (piece.bottomConnector === 'out') classes.push('bottom-out');

    if (piece.leftConnector === 'in') classes.push('left-in');
    else if (piece.leftConnector === 'out') classes.push('left-out');

    return classes.join(' ');
  }

  startGame() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timeLeft = this.maxTime;
    this.timeElapsed = 0;

    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.timeElapsed++;
      } else {
        clearInterval(this.timer);
        this.showTimeUpAlert();
      }
    }, 1000);

    this.initializePuzzle();
    this.gameStarted = true;
    this.gameCompleted = false;

    // Verificar que la imagen se cargue
    this.checkImageLoad();
  }

  shufflePiecesForSidebar() {
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
      this.returnToSidebar(this.draggedPiece);
    } else {
      // Colocar la pieza en el tablero
      this.draggedPiece.inBoard = true;
      this.draggedPiece.currentRow = targetRow;
      this.draggedPiece.currentCol = targetCol;
      this.draggedPiece.correctPos = isCorrectPosition;
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

  checkGameCompletion() {
    if (this.correctPieces === this.totalPieces) {
      this.gameCompleted = true;
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.showCompletionAlert();
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
    this.isPanelOpen = !this.isPanelOpen;
  }
  getPieceStyle(piece: PuzzlePiece) {
    if (!piece) return {};

    const pieceWidth = this.imageWidth / this.cols;
    const pieceHeight = this.imageHeight / this.rows;
    const scale = this.isInSidebar(piece) ? 0.6 : 1; // Reducir escala en sidebar
    const isInBoard = !this.isInSidebar(piece);

    const baseStyle = {
      width: isInBoard ? '100%' : `${pieceWidth * scale}px`,
      height: isInBoard ? '100%' : `${pieceHeight * scale}px`,
      'background-image': `url(${this.puzzleImageUrl})`,
      'background-position': `-${piece.col * pieceWidth}px -${
        piece.row * pieceHeight
      }px`,
      'background-size': `${this.imageWidth}px ${this.imageHeight}px`,
      'background-repeat': 'no-repeat',
      cursor: this.gameStarted && !this.gameCompleted ? 'grab' : 'default',
      border: isInBoard
        ? '1px solid rgba(147, 51, 234, 0.3)'
        : '2px solid rgba(102, 102, 102, 0.5)',
      'border-radius': isInBoard ? '2px' : '8px',
      'box-shadow':
        this.selectedPiece?.id === piece.id
          ? '0 0 0 2px #9333EA, 0 4px 12px rgba(147, 51, 234, 0.2)'
          : isInBoard
          ? 'none'
          : '0 2px 4px rgba(0,0,0,0.1)',
      display: 'block',
      position: isInBoard ? 'absolute' : 'relative',
      'box-sizing': 'border-box',
      transition: 'all 0.2s ease',
      transform:
        this.selectedPiece?.id === piece.id ? 'scale(1.05)' : 'scale(1)',
      top: isInBoard ? '0' : 'auto',
      left: isInBoard ? '0' : 'auto',
      margin: isInBoard ? '0' : '4px',
      padding: '0',
      'object-fit': 'cover',
    };

    // Si la imagen no se carga, agregar un fallback
    return baseStyle;
  }

  checkImageLoad() {
    const img = new Image();
    img.onload = () => {
      console.log('Imagen cargada correctamente');
    };
    img.onerror = () => {
      console.error('Error al cargar la imagen, usando imagen por defecto');
      this.puzzleImageUrl = 'assets/rompecabezas.png';
    };
    img.src = this.puzzleImageUrl;
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
  }

  // Método auxiliar para crear arrays en el template
  createArray(length: number): number[] {
    return Array.from({ length }, (_, i) => i);
  }

  // SweetAlert2 Methods
  private showCompletionAlert(): void {
    Swal.fire({
      title: '¡Felicidades! 🧩',
      html: `
        <div style="text-align: center;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
          <p style="font-size: 1.2rem; margin-bottom: 1rem;">
            ¡Has completado el rompecabezas en <strong>${this.formatTime(this.timeElapsed)}</strong>!
          </p>
          <p style="font-size: 1rem; color: #6b7280;">
            Todas las piezas están en su lugar correcto
          </p>
        </div>
      `,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: '🎮 Jugar de nuevo',
      cancelButtonText: 'Continuar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'animated-popup',
        confirmButton: 'kid-friendly-button',
        cancelButton: 'kid-friendly-button-secondary'
      },
      backdrop: `
        rgba(0,0,123,0.4)
        url("/assets/confetti.gif")
        left top
        no-repeat
      `
    }).then((result) => {
      if (result.isConfirmed) {
        this.startGame();
      } else {
        // Check if user should rate the game
        this.checkIfUserHasRated();
      }
    });
  }

  private showTimeUpAlert(): void {
    Swal.fire({
      title: '¡Tiempo agotado! ⏰',
      html: `
        <div style="text-align: center;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">😅</div>
          <p style="font-size: 1.2rem; margin-bottom: 1rem;">
            Se acabó el tiempo, pero has colocado <strong>${this.correctPieces}</strong> de <strong>${this.totalPieces}</strong> piezas correctamente
          </p>
          <p style="font-size: 1rem; color: #6b7280;">
            ¡Sigue practicando!
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '🔄 Intentar de nuevo',
      cancelButtonText: 'Continuar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'animated-popup',
        confirmButton: 'kid-friendly-button',
        cancelButton: 'kid-friendly-button-secondary'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.startGame();
      } else {
        // Check if user should rate the game
        this.checkIfUserHasRated();
      }
    });
  }

  private showErrorAlert(message: string): void {
    Swal.fire({
      title: '¡Ups! 😊',
      html: `
        <div style="text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🤔</div>
          <p style="font-size: 1.1rem; margin-bottom: 1rem;">
            ${message}
          </p>
          <p style="font-size: 0.9rem; color: #6b7280;">
            ¡No te preocupes, vuelve a intentarlo!
          </p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: '👍 Entendido',
      confirmButtonColor: '#3b82f6',
      customClass: {
        popup: 'animated-popup',
        confirmButton: 'kid-friendly-button'
      }
    });
  }

  // Rating methods
  private async checkIfUserHasRated(): Promise<void> {
    if (this.gameInstanceId === 0) return;

    try {
      this.hasUserRated = await this.ratingService.hasUserRatedGame(this.gameInstanceId).toPromise() || false;
      
      if (!this.hasUserRated) {
        this.mostrarModalDeValoracion();
      }
    } catch (error) {
      console.error('Error checking if user has rated:', error);
    }
  }

  private mostrarModalDeValoracion(): void {
    this.mostrarModalRating = true;
  }

  onRatingModalClose(): void {
    this.mostrarModalRating = false;
  }

  onGameRated(): void {
    this.mostrarModalRating = false;
    this.hasUserRated = true;
  }

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleHeader(): void {
    this.headerExpanded = !this.headerExpanded;
  }

  protected readonly Array = Array;
}
