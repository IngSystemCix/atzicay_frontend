import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface WordCell {
  letter: string;
  isFound: boolean;
  position: { row: number; col: number };
}

@Component({
  selector: 'app-game-board',
  imports: [CommonModule],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css'
})
export class GameBoardComponent {
 @Input() grid: WordCell[][] = [];
  @Input() gridCols: number = 12;
  @Input() selection: WordCell[] = [];
  
  @Output() cellMouseDown = new EventEmitter<WordCell>();
  @Output() cellMouseOver = new EventEmitter<WordCell>();
  @Output() cellMouseUp = new EventEmitter<void>();
  @Output() cellMouseLeave = new EventEmitter<void>();

  
}
