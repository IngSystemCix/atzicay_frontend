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

  getCurrentPieceStyle(piece: PuzzlePiece): any {
    // Implementa la lógica de estilo como en el componente principal
    // Esto debería moverse a un servicio compartido si se usa en varios lugares
    return {
      'background-image': `url('${this.puzzleImageUrl}')`,
      // ... otros estilos
    };
  }
}
