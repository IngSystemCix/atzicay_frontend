import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-word-timer',
  imports: [CommonModule],
  templateUrl: './word-timer.component.html',
  styleUrl: './word-timer.component.css',
})
export class WordTimerComponent {
  @Input() timeLeft: number = 0;

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
