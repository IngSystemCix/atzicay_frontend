import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hangman-drawing',
  standalone: true,
  templateUrl: './hangman-drawing.component.html',
  styleUrls: ['./hangman-drawing.component.css']
})
export class HangmanDrawingComponent {
  @Input() attemptsLeft: number = 6;
  @Input() color: string = '#000000';
}