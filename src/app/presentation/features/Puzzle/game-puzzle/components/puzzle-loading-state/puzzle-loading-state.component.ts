import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-puzzle-loading-state',
  imports: [CommonModule],
  templateUrl: './puzzle-loading-state.component.html',
  styleUrl: './puzzle-loading-state.component.css'
})
export class PuzzleLoadingStateComponent {
    @Input() message: string = 'Cargando...';
}
