import { Component } from '@angular/core';
import { GamePuzzleComponent } from '../../game-puzzle.component';

@Component({
  selector: 'app-puzzle-game',
  standalone: true,
  imports: [GamePuzzleComponent],
  templateUrl: './puzzle-game.component.html',
  styleUrl: './puzzle-game.component.css'
})
export class PuzzleGameComponent {}
