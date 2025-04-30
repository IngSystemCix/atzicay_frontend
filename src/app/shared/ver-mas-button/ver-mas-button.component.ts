import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ver-mas-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ver-mas-button.component.html',
  styleUrl: './ver-mas-button.component.css'
})
export class VerMasButtonComponent {

  cargarMas() {
    console.log('Cargando más juegos...');
    // Aquí iría la lógica para cargar más juegos
  }
}
