import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-puzzle-start-screen',
  imports: [CommonModule],
  templateUrl: './puzzle-start-screen.component.html',
  styleUrl: './puzzle-start-screen.component.css'
})
export class PuzzleStartScreenComponent {
  @Output() startGame = new EventEmitter<void>();
}
