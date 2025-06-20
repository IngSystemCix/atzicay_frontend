import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GameConfigurationService } from '../../../../core/infrastructure/api/GameSetting/game-configuration.service';

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
  imports: [CommonModule],
  templateUrl: './game-puzzle.component.html',
  styleUrl: './game-puzzle.component.css'
})
export class GamePuzzleComponent implements OnInit {
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
  gameConfig: any;
  
  // URL de la imagen del puzzle
  puzzleImageUrl = 'assets/pedrito.jpg';

  // Variable para seguimiento de piezas seleccionadas
  selectedPiece: PuzzlePiece | null = null;

  // Nueva propiedad para controlar el panel lateral
  isPanelOpen = true;

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
          this.gameConfig = response;
          this.rows = this.gameConfig.rows || 4;
          this.cols = this.gameConfig.cols || 4;
          this.totalPieces = this.rows * this.cols;
          this.maxTime = this.gameConfig.maxTime || 300;
          this.imageWidth = this.gameConfig.imageWidth || 600;
          this.imageHeight = this.gameConfig.imageHeight || 450;
          this.sidebarWidth = this.gameConfig.sidebarWidth || 200;
          this.puzzleImageUrl = this.gameConfig.imageUrl || 'assets/pedrito.jpg';

          this.loading = false;
          this.startGame();
        },
        error: (err) => {
          this.error = 'Error al cargar la configuración del juego';
          this.loading = false;
          // Usar valores por defecto si hay error
          this.startGame();
        }
      });
    } else {
      // Si no hay ID válido, usar configuración por defecto
      this.startGame();
    }
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
        const piece = this.pieces.find(p => p.row === row && p.col === col);
        if (!piece) continue;

        // Conector derecho (solo si no es la última columna)
        if (col < this.cols - 1) {
          const rightPiece = this.pieces.find(p => p.row === row && p.col === col + 1);
          if (rightPiece && piece.rightConnector === 'none' && rightPiece.leftConnector === 'none') {
            const isOut = Math.random() > 0.5;
            piece.rightConnector = isOut ? 'out' : 'in';
            rightPiece.leftConnector = isOut ? 'in' : 'out';
          }
        }

        // Conector inferior (solo si no es la última fila)
        if (row < this.rows - 1) {
          const bottomPiece = this.pieces.find(p => p.row === row + 1 && p.col === col);
          if (bottomPiece && piece.bottomConnector === 'none' && bottomPiece.topConnector === 'none') {
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
          leftConnector: 'none'
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
        this.endGame();
      }
    }, 1000);

    this.initializePuzzle();
    this.gameStarted = true;
    this.gameCompleted = false;
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

    const isCorrectPosition = this.draggedPiece.row === targetRow && this.draggedPiece.col === targetCol;

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
    this.correctPieces = this.pieces.filter(p => p.correctPos).length;
  }

  checkGameCompletion() {
    if (this.correctPieces === this.totalPieces) {
      this.gameCompleted = true;
      if (this.timer) {
        clearInterval(this.timer);
      }
    }
  }

  isPieceAt(row: number, col: number): boolean {
    return this.pieces.some(p => p.inBoard && p.currentRow === row && p.currentCol === col);
  }

  getPieceAt(row: number, col: number): PuzzlePiece | null {
    return this.pieces.find(p => p.inBoard && p.currentRow === row && p.currentCol === col) || null;
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
    const scale = this.isInSidebar(piece) ? 0.8 : 1;
    const isInBoard = !this.isInSidebar(piece);

    return {
      'width': isInBoard ? '100%' : `${pieceWidth * scale}px`,
      'height': isInBoard ? '100%' : `${pieceHeight * scale}px`,
      'background-image': `url(${this.puzzleImageUrl})`,
      'background-position': `-${piece.col * pieceWidth}px -${piece.row * pieceHeight}px`,
      'background-size': `${this.imageWidth}px ${this.imageHeight}px`,
      'background-repeat': 'no-repeat',
      'cursor': this.gameStarted && !this.gameCompleted ? 'grab' : 'default',
      'border': isInBoard ? '1px solid rgba(147, 51, 234, 0.3)' : '2px solid rgba(102, 102, 102, 0.5)',
      'border-radius': isInBoard ? '2px' : '8px',
      'box-shadow': this.selectedPiece?.id === piece.id 
        ? '0 0 0 2px #9333EA, 0 4px 12px rgba(147, 51, 234, 0.2)' 
        : isInBoard ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
      'display': 'block',
      'position': isInBoard ? 'absolute' : 'relative',
      'box-sizing': 'border-box',
      'transition': 'all 0.2s ease',
      'transform': this.selectedPiece?.id === piece.id ? 'scale(1.05)' : 'scale(1)',
      'top': isInBoard ? '0' : 'auto',
      'left': isInBoard ? '0' : 'auto',
      'margin': '0',
      'padding': '0'
    };
  }
  getDropZoneStyle() {
    const pieceWidth = this.imageWidth / this.cols;
    const pieceHeight = this.imageHeight / this.rows;

    return {
      'width': `${pieceWidth}px`,
      'height': `${pieceHeight}px`,
      'min-width': `${pieceWidth}px`,
      'min-height': `${pieceHeight}px`,
      'max-width': `${pieceWidth}px`,
      'max-height': `${pieceHeight}px`,
      'position': 'relative',
      'box-sizing': 'border-box',
      'border': '1px dashed rgba(147, 51, 234, 0.2)',
      'background-color': 'rgba(255, 255, 255, 0.1)',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'overflow': 'hidden'
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

  protected readonly Array = Array;
}