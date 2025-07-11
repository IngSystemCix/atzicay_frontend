import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface WordCell {
  letter: string;
  isFound: boolean;
  position: { row: number; col: number };
}

interface Word {
  text: string;
  found: boolean;
  positions?: { row: number; col: number }[];
  orientation?: string;
}
@Component({
  selector: 'app-word-sidebar',
  imports: [CommonModule],
  templateUrl: './word-sidebar.component.html',
  styleUrl: './word-sidebar.component.css',
})
export class WordSidebarComponent {
  @Input() words: Word[] = [];
  @Input() wordsFound: number = 0;
  @Input() totalWords: number = 0;
  @Input() porcentajeProgreso: number = 0;
  @Input() timeLeft: number = 0;

  @Output() resetGame = new EventEmitter<void>();

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
