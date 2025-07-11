import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-hangman-hint',
  standalone: true,
  templateUrl: './hangman-hint.component.html',
  styleUrls: ['./hangman-hint.component.css']
})
export class HangmanHintComponent {
  @Input() hint: string = '';
  @Input() showHint: boolean = false;
  @Output() hintToggled = new EventEmitter<void>();

  toggleHint(): void {
    this.hintToggled.emit();
  }
}