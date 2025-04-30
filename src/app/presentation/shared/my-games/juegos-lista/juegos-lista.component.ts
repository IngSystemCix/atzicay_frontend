import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type Dificultad = 'basico' | 'intermedio' | 'dificil';

interface Juego {
  id: number;
  tipo: string;
  icono: string;
  titulo: string;
  vecesJugado: number;
  puntuacion: number;
  estado: 'Activo' | 'Desactivado';
  dificultad: Dificultad;
}

@Component({
  selector: 'app-juegos-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './juegos-lista.component.html',
  styleUrl: './juegos-lista.component.css'
})
export class JuegosListaComponent {
  @Input() filtroActual: string = 'Todos'; // Nuevo

  menuAbierto: number | null = null;

  juegos: Juego[] = [
    {
      id: 1,
      tipo: 'Ahorcado',
      icono: '🪓',
      titulo: 'Ahorcado: Animales',
      vecesJugado: 56,
      puntuacion: 4.8,
      estado: 'Activo',
      dificultad: 'basico',
    },
    {
      id: 2,
      tipo: 'Rompecabezas',
      icono: '🧩',
      titulo: 'Rompecabezas: Sistema Solar',
      vecesJugado: 42,
      puntuacion: 3.5,
      estado: 'Activo',
      dificultad: 'intermedio'
    },
    {
      id: 3,
      tipo: 'Memoria',
      icono: '🃏',
      titulo: 'Memoria: Capitales del Mundo',
      vecesJugado: 28,
      puntuacion: 4.2,
      estado: 'Desactivado',
      dificultad: 'dificil'
    }
  ];

  get juegosFiltrados(): Juego[] {
    if (this.filtroActual === 'Todos') {
      return this.juegos;
    }
    return this.juegos.filter(j => j.tipo === this.filtroActual);
  }

  toggleMenu(id: number) {
    this.menuAbierto = this.menuAbierto === id ? null : id;
  }

  programarJuego(id: number) {
    console.log(`Programar juego ${id}`);
    this.menuAbierto = null;
  }

  eliminarJuego(id: number) {
    console.log(`Eliminar juego ${id}`);
    this.menuAbierto = null;
  }

  editarJuego(id: number) {
    console.log(`Editar juego ${id}`);
    this.menuAbierto = null;
  }
}
