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
  
  // Nuevas propiedades para personalización según el tipo de juego
  @Input() mostrarVidas: boolean = true; // Para juegos como hangman
  @Input() mostrarTiempo: boolean = true; // Para todos los juegos
  @Input() mostrarProgreso: boolean = true; // Para todos los juegos
  @Input() tipoJuego: 'hangman' | 'puzzle' | 'memory' | 'solve-word' | 'other' = 'other';
  
  @Output() toggleHeader = new EventEmitter<void>();
  @Output() toggleMobileMenu = new EventEmitter<void>();
  @Output() volverAlDashboard = new EventEmitter<void>();

  formatearTiempo(): string {
    const minutos = Math.floor(this.tiempoRestante / 60);
    const segundos = this.tiempoRestante % 60;
    return `${minutos}:${segundos < 10 ? '0' + segundos : segundos}`;
  }

  // Getter para determinar la configuración del grid basado en qué elementos mostrar
  get gridColumns(): string {
    const elementos = [this.mostrarVidas, this.mostrarProgreso, this.mostrarTiempo].filter(Boolean).length;
    return elementos === 3 ? 'md:grid-cols-3' : elementos === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1';
  }

  // Getter para obtener las etiquetas apropiadas según el tipo de juego
  get etiquetaProgreso(): string {
    switch (this.tipoJuego) {
      case 'puzzle':
        return 'Piezas';
      case 'hangman':
        return 'Palabras';
      case 'memory':
        return 'Pares';
      case 'solve-word':
        return 'Palabras';
      default:
        return 'Progreso';
    }
  }

  get etiquetaVidas(): string {
    switch (this.tipoJuego) {
      case 'puzzle':
        return 'Intentos';
      case 'hangman':
        return this.vidasRestantes === 1 ? 'Vida' : 'Vidas';
      case 'memory':
        return 'Intentos';
      case 'solve-word':
        return 'Intentos';
      default:
        return 'Vidas';
    }
  }
}