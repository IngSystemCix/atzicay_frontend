import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-loading-states',
  imports: [CommonModule],
  templateUrl: './game-loading-states.component.html',
  styleUrl: './game-loading-states.component.css'
})
export class GameLoadingStatesComponent {
  @Input() isLoading: boolean = false;
  @Input() loading: boolean = false;
  @Input() authError: string | null = null;
  @Input() error: string | null = null;
}
