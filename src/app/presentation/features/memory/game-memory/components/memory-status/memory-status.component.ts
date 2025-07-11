import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-memory-status',
  templateUrl: './memory-status.component.html',
  styleUrls: ['./memory-status.component.css']
})
export class MemoryStatusComponent {
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() gameStarted = false;
  @Input() gameCompleted = false;
  @Input() timer = 0;
  @Input() matches = 0;
  @Input() totalPairs = 0;
  @Output() startGame = new EventEmitter<void>();
  @Output() resetGame = new EventEmitter<void>();

  getFormattedTime(): string {
    const minutes = Math.floor(this.timer / 60);
    const seconds = this.timer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}