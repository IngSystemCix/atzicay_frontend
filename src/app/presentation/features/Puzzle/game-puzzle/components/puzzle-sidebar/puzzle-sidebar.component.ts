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
    // Implementa la lógica de estilo como en el componente principal
    // Esto debería moverse a un servicio compartido si se usa en varios lugares
    return {
      'background-image': `url('assets/pedrito.jpg')`,
      // ... otros estilos
    };
  }
}
