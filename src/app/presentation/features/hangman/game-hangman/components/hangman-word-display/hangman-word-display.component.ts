import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hangman-word-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hangman-word-display.component.html',
  styleUrls: ['./hangman-word-display.component.css']
})
export class HangmanWordDisplayComponent {
  @Input() word: string = '';
  @Input() revealedLetters: string[] = [];
  @Input() selectedLetters: Set<string> = new Set();

  isSpace(index: number): boolean {
    return this.word[index] === ' ';
  }

  getRevealedCharacter(index: number): string {
    if (this.isSpace(index)) {
      return ' ';
    }
    return this.revealedLetters[index] || '';
  }
}