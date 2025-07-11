import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-puzzle-error-state',
  imports: [CommonModule],
  templateUrl: './puzzle-error-state.component.html',
  styleUrl: './puzzle-error-state.component.css',
})
export class PuzzleErrorStateComponent {
  @Input() errorMessage: string = '';
  @Output() backToDashboard = new EventEmitter<void>();
}
