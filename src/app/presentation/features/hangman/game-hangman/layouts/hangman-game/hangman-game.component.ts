import { Component } from '@angular/core';
import { GameHangmanComponent } from '../../game-hangman.component';

@Component({
  selector: 'app-hangman-game',
  standalone: true,
  imports: [GameHangmanComponent],
  templateUrl: './hangman-game.component.html'
})
export class HangmanGameComponent {}
