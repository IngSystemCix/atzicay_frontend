import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-puzzle-complete-screen',
  imports: [CommonModule],
  templateUrl: './puzzle-complete-screen.component.html',
  styleUrl: './puzzle-complete-screen.component.css'
})
export class PuzzleCompleteScreenComponent {
  @Input() timeElapsed: number = 0;
  @Input() totalPieces: number = 0;
  @Output() backToDashboard = new EventEmitter<void>();

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
