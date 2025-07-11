import { Component, Input } from '@angular/core';
import { GameSolveTheWordComponent } from '../../game-solve-the-word.component';

@Component({
  selector: 'app-solve-the-word-game',
  standalone: true,
  imports: [GameSolveTheWordComponent],
  templateUrl: './solve-the-word-game.component.html',
  styleUrl: './solve-the-word-game.component.css'
})
export class SolveTheWordGameComponent {
  @Input() withProgrammings: boolean = false;
}
