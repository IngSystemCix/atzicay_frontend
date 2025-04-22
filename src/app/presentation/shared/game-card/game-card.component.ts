import { Component, Input, ElementRef, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import {NgClass, NgForOf} from '@angular/common';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  imports: [
    NgClass,
    NgForOf
  ],
  styleUrls: ['./game-card.component.css']
})
export class GameCardComponent implements AfterViewInit {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() level: string = 'Básico';
  @Input() author: string = '';
  @Input() rating: number = 0;

  @ViewChild('menuButton') menuButton!: ElementRef;
  @ViewChild('menuDropdown') menuDropdown!: ElementRef;

  isMenuOpen: boolean = false;

  constructor(private renderer: Renderer2) {
    // Cierra el menú al hacer clic en cualquier parte del documento
    this.renderer.listen('document', 'click', (event: Event) => {
      if (this.isMenuOpen &&
        !this.menuButton.nativeElement.contains(event.target) &&
        !this.menuDropdown.nativeElement.contains(event.target)) {
        this.isMenuOpen = false;
        this.renderer.setStyle(this.menuDropdown.nativeElement, 'display', 'none');
      }
    });
  }

  ngAfterViewInit() {
    // Configurar comportamiento del menú
    this.renderer.listen(this.menuButton.nativeElement, 'click', (event: Event) => {
      event.stopPropagation();
      this.isMenuOpen = !this.isMenuOpen;

      if (this.isMenuOpen) {
        this.renderer.setStyle(this.menuDropdown.nativeElement, 'display', 'block');
      } else {
        this.renderer.setStyle(this.menuDropdown.nativeElement, 'display', 'none');
      }
    });
  }
}
