import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-juegos-filtros',
  standalone: true,
  imports: [],
  templateUrl: './juegos-filtros.component.html',
  styleUrl: './juegos-filtros.component.css'
})
export class JuegosFiltrosComponent {
  filtroSeleccionado: string = 'Todos';
  filtros: string[] = ['Todos', 'Ahorcado', 'Rompecabezas', 'Memoria', 'Pupiletras'];

  @Output() filtroChange = new EventEmitter<string>();

  filtrar(tipo: string) {
    this.filtroSeleccionado = tipo;
    console.log(`Filtrando por: ${tipo}`);
    this.filtroChange.emit(tipo);
  }
}
