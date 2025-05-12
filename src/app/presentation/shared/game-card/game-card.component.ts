// game-card.component.ts
import { Component, Input, ElementRef, ViewChild, HostListener  } from '@angular/core';

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
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;

  isDropdownOpen = false;
  ratingArray: number[] = [1, 2, 3, 4, 5];

  get levelClasses(): string {
    switch(this.level.toLowerCase()) {
      case 'E':
        return 'bg-[#C9FFD0] text-green-800';
      case 'M':
        return 'bg-[#FFFEC2] text-yellow-800';
      case 'D':
        return 'bg-[#FFB4B4] text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  }

  dropdownToggle() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Close dropdown when clicking outside
  closeDropdown() {
    this.isDropdownOpen = false;
  }
}
