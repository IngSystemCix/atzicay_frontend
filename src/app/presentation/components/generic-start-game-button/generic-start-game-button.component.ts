
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generic-start-game-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generic-start-game-button.component.html',
  styleUrls: ['./generic-start-game-button.component.css']
})
export class GenericStartGameButtonComponent {
  @Input() backgroundColor: string = '#a855f7';
  @Input() fontColor: string = '#fff';
  @Input() font: string = 'Arial';
  @Output() onStart = new EventEmitter<void>();

  startGame() {
    this.onStart.emit();
  }
}