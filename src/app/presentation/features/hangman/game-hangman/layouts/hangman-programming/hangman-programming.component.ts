import { Component } from '@angular/core';
import { GameHangmanComponent } from '../../game-hangman.component';

@Component({
  selector: 'app-hangman-programming',
  standalone: true,
  imports: [GameHangmanComponent],
  templateUrl: './hangman-programming.component.html'
})
export class HangmanProgrammingComponent {}
