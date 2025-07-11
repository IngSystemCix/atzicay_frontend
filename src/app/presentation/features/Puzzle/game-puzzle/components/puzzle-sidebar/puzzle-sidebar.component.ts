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
  selector: 'app-puzzle-sidebar',
  imports: [CommonModule],
  templateUrl: './puzzle-sidebar.component.html',
  styleUrl: './puzzle-sidebar.component.css',
})
export class PuzzleSidebarComponent {
  @Input() pieces: PuzzlePiece[] = [];
  @Input() selectedPiece: PuzzlePiece | null = null;
  @Input() isPanelOpen: boolean = true;
  @Input() isMobileView: boolean = false;
  @Input() remainingPiecesCount: number = 0;
  @Input() puzzleImageUrl: string = '';
  @Input() rows: number = 4;
  @Input() cols: number = 4;
  @Input() boardSize: { width: number; height: number } = { width: 700, height: 700 };

  @Output() pieceClick = new EventEmitter<PuzzlePiece>();
  @Output() dragStart = new EventEmitter<{
    piece: PuzzlePiece;
    event: DragEvent;
  }>();
  @Output() dragEnd = new EventEmitter<DragEvent>();
  @Output() togglePanel = new EventEmitter<void>();

  isInSidebar(piece: PuzzlePiece): boolean {
    return !piece.inBoard;
  }

  getPieceStyle(piece: PuzzlePiece): any {
    // Tamaño igual al del board, adaptativo
    const boardWidth = this.boardSize.width;
    const boardHeight = this.boardSize.height;
    const pieceWidth = boardWidth / this.cols;
    const pieceHeight = boardHeight / this.rows;
    const displayWidth = pieceWidth;
    const displayHeight = pieceHeight;
    const bgPosX = -piece.col * pieceWidth;
    const bgPosY = -piece.row * pieceHeight;
    const bgSizeWidth = boardWidth;
    const bgSizeHeight = boardHeight;
    let border = '2px solid rgba(147, 51, 234, 0.3)';
    let boxShadow = '0 2px 8px rgba(147, 51, 234, 0.1)';
    let borderRadius = '8px';
    if (this.selectedPiece?.id === piece.id) {
      border = '2px solid #9333EA';
      boxShadow = '0 0 0 2px #9333EA, 0 4px 12px rgba(147, 51, 234, 0.3)';
    }
    return {
      'width.px': Math.round(displayWidth),
      'height.px': Math.round(displayHeight),
      'background-image': `url('${this.puzzleImageUrl}')`,
      'background-position': `${Math.round(bgPosX)}px ${Math.round(bgPosY)}px`,
      'background-size': `${Math.round(bgSizeWidth)}px ${Math.round(bgSizeHeight)}px`,
      'background-repeat': 'no-repeat',
      border: border,
      'border-radius': borderRadius,
      'box-shadow': boxShadow,
      cursor: 'grab',
      display: 'block',
      position: 'relative',
      'box-sizing': 'border-box',
      transition: 'all 0.2s ease',
      margin: '4px',
      padding: '0',
      overflow: 'hidden',
      'flex-shrink': '0',
      'image-rendering': 'high-quality'
    };
  }
}
