import { Component, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [
    NgClass,
    RouterLink
  ],
  templateUrl: './game-card.component.html'
})
export class GameCardComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() level: string = '';
  @Input() author: string = '';
  @Input() rating: number = 0;
  @Input() image: string = '';
  @Input() gameType: string = '';
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;

  isDropdownOpen = false;
  ratingArray: number[] = [1, 2, 3, 4, 5];

  // Determina la ruta basada en el tipo de juego
  get gameRoute(): string {
    switch(this.gameType.toLowerCase()) {
      case 'hangman':
        return '/juegos/jugar-hangman';
      case 'sopa-de-letras':
      case 'solve-the-word':
        return '/juegos/solve-the-word';
      default:
        return '/juegos'; // Ruta por defecto si no coincide con ningún tipo
    }
  }

  get levelClasses(): string {
    switch(this.level.toLowerCase()) {
      case 'e':
        return 'bg-[#C9FFD0] text-green-800';
      case 'm':
        return 'bg-[#FFFEC2] text-yellow-800';
      case 'd':
        return 'bg-[#FFB4B4] text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  }

  dropdownToggle() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (this.dropdownMenu && !this.dropdownMenu.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  // Close dropdown when clicking outside
  closeDropdown() {
    this.isDropdownOpen = false;
  }
}
