// game-card.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-game-card',
  standalone: true,
  templateUrl: './game-card.component.html',
})
export class GameCardComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() level: string = '';
  @Input() author: string = '';
  @Input() rating: number = 0;
  @Input() image: string = '';

  ratingArray: number[] = [1, 2, 3, 4, 5];

  get levelClasses(): string {
    switch(this.level.toLowerCase()) {
      case 'básico':
        return 'bg-[#C9FFD0] text-green-800';
      case 'intermedio':
        return 'bg-[#FFFEC2] text-yellow-800';
      case 'avanzado':
        return 'bg-[#FFB4B4] text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  }
}
