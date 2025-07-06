import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-header.component.html',
  styleUrls: ['./game-header.component.css']
})
export class GameHeaderComponent {
  @Input() tituloJuego: string = '';
  @Input() descripcionJuego: string = '';
  @Input() vidasRestantes: number = 0;
  @Input() palabrasCompletadas: number = 0;
  @Input() totalPalabras: number = 0;
  @Input() tiempoRestante: number = 0;
  @Input() porcentajeProgreso: number = 0;
  @Input() headerExpanded: boolean = true;
  @Input() mobileMenuOpen: boolean = false;
  
  @Output() toggleHeader = new EventEmitter<void>();
  @Output() toggleMobileMenu = new EventEmitter<void>();
  @Output() volverAlDashboard = new EventEmitter<void>();

  formatearTiempo(): string {
    const minutos = Math.floor(this.tiempoRestante / 60);
    const segundos = this.tiempoRestante % 60;
    return `${minutos}:${segundos < 10 ? '0' + segundos : segundos}`;
  }
}