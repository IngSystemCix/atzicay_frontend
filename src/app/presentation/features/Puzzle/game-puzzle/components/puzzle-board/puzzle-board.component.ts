import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  selector: 'app-puzzle-board',
  imports: [CommonModule],
  templateUrl: './puzzle-board.component.html',
  styleUrl: './puzzle-board.component.css',
})
export class PuzzleBoardComponent {
  @Input() pieces: PuzzlePiece[] = [];
  @Input() rows: number = 4;
  @Input() cols: number = 4;
  @Input() rowArray: number[] = [];
  @Input() colArray: number[] = [];
  @Input() puzzleImageUrl: string = '';
  @Input() selectedPiece: PuzzlePiece | null = null;
  @Input() gameStarted: boolean = false;
  @Input() boardSize: { width: number; height: number } = {
    width: 700,
    height: 700,
  };

  @Output() pieceClick = new EventEmitter<PuzzlePiece>();
  @Output() dragStart = new EventEmitter<{
    piece: PuzzlePiece;
    event: DragEvent;
  }>();
  @Output() dragEnd = new EventEmitter<DragEvent>();
  @Output() drop = new EventEmitter<{
    row: number;
    col: number;
    dragEvent: DragEvent;
  }>();

  isPieceAt(row: number, col: number): boolean {
    return this.pieces.some(
      (p) => p.inBoard && p.currentRow === row && p.currentCol === col
    );
  }

  isPieceCorrect(row: number, col: number): boolean {
    const piece = this.pieces.find(
      (p) => p.inBoard && p.currentRow === row && p.currentCol === col
    );
    return !!piece?.correctPos;
  }

  // Agregar este método mejorado para getCurrentPieceStyle
getCurrentPieceStyle(piece: PuzzlePiece): any {
  const cellWidth = this.boardSize.width / this.cols;
  const cellHeight = this.boardSize.height / this.rows;
  
  // Calcular el tamaño total de la imagen original
  const totalImageWidth = cellWidth * this.cols;
  const totalImageHeight = cellHeight * this.rows;
  
  // Calcular la posición de recorte para esta pieza
  const backgroundPositionX = -(piece.col * cellWidth);
  const backgroundPositionY = -(piece.row * cellHeight);
  
  return {
    'background-image': `url('${this.puzzleImageUrl}')`,
    'background-size': `${totalImageWidth}px ${totalImageHeight}px`,
    'background-position': `${backgroundPositionX}px ${backgroundPositionY}px`,
    'background-repeat': 'no-repeat',
    'width': '100%',
    'height': '100%',
    'display': 'block',
    'image-rendering': 'crisp-edges'
  };
}

// Agregar método para obtener la pieza en una posición específica
getPieceAt(row: number, col: number): PuzzlePiece | null {
  return this.pieces.find(
    (p) => p.inBoard && p.currentRow === row && p.currentCol === col
  ) || null;
}
}
