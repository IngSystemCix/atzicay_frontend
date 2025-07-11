import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hangman-keyboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hangman-keyboard.component.html',
  styleUrls: ['./hangman-keyboard.component.css']
})
export class HangmanKeyboardComponent {
  @Input() alphabet: string[] = [];
  @Input() selectedLetters: Set<string> = new Set();
  @Input() word: string = '';
  @Input() disabled: boolean = false;
  @Output() letterSelected = new EventEmitter<string>();

  selectLetter(letra: string): void {
    this.letterSelected.emit(letra);
  }

  isLetterSelected(letra: string): boolean {
    return this.selectedLetters.has(letra);
  }

  isLetterInWord(letra: string): boolean {
    return this.word.includes(letra);
  }
}