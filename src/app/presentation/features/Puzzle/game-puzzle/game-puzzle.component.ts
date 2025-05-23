import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PuzzlePiece {
  id: number;
  row: number;         // Posición correcta fila
  col: number;         // Posición correcta columna
  currentRow: number;  // Posición actual fila
  currentCol: number;  // Posición actual columna
  inBoard: boolean;    // Indica si la pieza está en el tablero
  correctPos: boolean; // Indica si la pieza está en la posición correcta
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
  rows = 6;
  cols = 6;
  totalPieces = this.rows * this.cols;
  gameStarted = false;
  gameCompleted = true;
  draggedPiece: PuzzlePiece | null = null;
  correctPieces = 0;
  timeElapsed = 0;
  timer: any;
  allowWrongPlacements = false; // Control para permitir colocaciones incorrectas
  maxTime = 300;
  timeLeft = this.maxTime;

  // Dimensiones de la imagen
  imageWidth = 800;
  imageHeight = 600;

  // Dimensiones para el área de piezas disponibles
  sidebarWidth = 200;

  ngOnInit() {
    this.startGame();
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
          currentRow: -1,     // Fuera del tablero inicialmente
          currentCol: -1,     // Fuera del tablero inicialmente
          inBoard: false,     // No está en el tablero inicialmente
          correctPos: false
        });
      }
    }

    // Mezclar las piezas en el sidebar (no en el tablero)
    this.shufflePiecesForSidebar();

    this.gameCompleted = false;
  }

  startGame() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timeLeft = this.maxTime;

    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
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
    // Mezclar las piezas (solo el orden, no sus posiciones en el tablero)
    for (let i = this.pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.pieces[i], this.pieces[j]] = [this.pieces[j], this.pieces[i]];
    }

    // Todas las piezas estarán en el sidebar
    this.pieces.forEach((piece) => {
      piece.inBoard = false;    // No está en el tablero
      piece.currentRow = -1;    // Posición fuera del tablero
      piece.currentCol = -1;    // Posición fuera del tablero
      piece.correctPos = false; // No está en posición correcta
    });

    // Actualizar el contador de piezas correctas
    this.correctPieces = 0;
  }

  // Variable para seguimiento de piezas seleccionadas
  selectedPiece: PuzzlePiece | null = null;

  // Método para manejar el clic en una pieza
  onPieceClick(piece: PuzzlePiece) {
    if (!this.gameStarted || this.gameCompleted || !piece) return;
    this.selectedPiece = piece;
  }

  // Métodos de arrastre y soltar
  onDragStart(piece: PuzzlePiece, event: DragEvent) {
    if (!this.gameStarted || this.gameCompleted || !piece) return;

    this.draggedPiece = piece;

    // Añadir datos al objeto dataTransfer para que funcione correctamente
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', piece.id.toString());
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Necesario para permitir soltar
  }

  onDrop(targetRow: number, targetCol: number, event: DragEvent) {
    event.preventDefault();

    if (!this.draggedPiece || !this.gameStarted || this.gameCompleted) return;

    // Verificar si la casilla ya está ocupada
    const targetOccupied = this.pieces.some(p =>
      p.inBoard && p.currentRow === targetRow && p.currentCol === targetCol);

    if (targetOccupied) {
      return; // No permitimos sobreponer piezas
    }

    const isCorrectPosition = this.draggedPiece.row === targetRow && this.draggedPiece.col === targetCol;

    // Si no permitimos colocaciones incorrectas y la posición no es correcta
    if (!this.allowWrongPlacements && !isCorrectPosition) {
      // Devolver la pieza al sidebar si no está en la posición correcta
      this.draggedPiece.inBoard = false;
      this.draggedPiece.currentRow = -1;
      this.draggedPiece.currentCol = -1;
      this.draggedPiece.correctPos = false;
    } else {
      // Colocar la pieza en el tablero
      this.draggedPiece.inBoard = true;
      this.draggedPiece.currentRow = targetRow;
      this.draggedPiece.currentCol = targetCol;
      this.draggedPiece.correctPos = isCorrectPosition;
    }

    // Actualizar el contador de piezas correctas
    this.updateCorrectPiecesCount();
    this.checkGameCompletion();

    this.draggedPiece = null;
  }

  // Método para devolver una pieza al sidebar
  returnToSidebar(piece: PuzzlePiece) {
    if (!this.gameStarted || this.gameCompleted || !piece) return;

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

  // Nuevos métodos para verificar piezas en posiciones específicas
  isPieceAt(row: number, col: number): boolean {
    return this.pieces.some(p => p.inBoard && p.currentRow === row && p.currentCol === col);
  }

  getPieceAt(row: number, col: number): PuzzlePiece {
    return this.pieces.find(p => p.inBoard && p.currentRow === row && p.currentCol === col)!;
  }

  isPieceCorrect(row: number, col: number): boolean {
    const piece = this.getPieceAt(row, col);
    return piece && piece.correctPos;
  }

  // Determinar si una pieza está en el sidebar
  isInSidebar(piece: PuzzlePiece): boolean {
    return !piece.inBoard;
  }

  // Obtener el estilo para una pieza
  getPieceStyle(piece: PuzzlePiece) {
    if (!piece) return {};

    const pieceWidth = this.imageWidth / this.cols;
    const pieceHeight = this.imageHeight / this.rows;

    const style = {
      'width.px': pieceWidth,
      'height.px': pieceHeight,
      'background-image': 'url(assets/pedrito.jpg)',
      'background-position': `-${piece.col * pieceWidth}px -${piece.row * pieceHeight}px`,
      'background-size': `${this.imageWidth}px ${this.imageHeight}px`,
      'cursor': this.gameStarted && !this.gameCompleted ? 'pointer' : 'default',
      'border': '1px solid #ccc',
      'box-shadow': this.selectedPiece?.id === piece.id ? '0 0 0 2px #9333EA' : '0 2px 4px rgba(0,0,0,0.1)',
      'display': 'block',
      'z-index': '10'
    };

    return style;
  }

  getDropZoneStyle() {
    const pieceWidth = this.imageWidth / this.cols;
    const pieceHeight = this.imageHeight / this.rows;

    return {
      'width.px': pieceWidth,
      'height.px': pieceHeight
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
      // Para cada pieza en el tablero, verificar si está en posición incorrecta
      this.pieces.forEach((piece) => {
        if (piece.inBoard && !piece.correctPos) {
          // Si está en posición incorrecta, devolverla al sidebar
          this.returnToSidebar(piece);
        }
      });
    }
  }

  endGame() {
    this.gameCompleted = true;
    this.gameStarted = false;
  }


  protected readonly Array = Array;
}
