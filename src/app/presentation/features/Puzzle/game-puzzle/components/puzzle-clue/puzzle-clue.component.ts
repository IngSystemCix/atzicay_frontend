import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-puzzle-clue',
  imports: [CommonModule],
  templateUrl: './puzzle-clue.component.html',
  styleUrl: './puzzle-clue.component.css',
})
export class PuzzleClueComponent {
  @Input() clue: string = '';
  @Input() mostrarPista: boolean = false;
  @Output() togglePista = new EventEmitter<void>();
}
