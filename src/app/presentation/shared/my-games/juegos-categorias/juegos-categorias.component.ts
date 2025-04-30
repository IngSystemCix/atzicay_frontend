import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-juegos-categorias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './juegos-categorias.component.html',
  styleUrl: './juegos-categorias.component.css'
})
export class JuegosCategoriasComponent {
  getColor(colorVar: string): string {
    return `var(--tw-${colorVar})`;
  }

  getTextColor(color: string): string {
    const map: Record<string, string> = {
      purple: '#7B5FEA',
      blue: '#3B82F6',
      green: '#16A34A',
      yellow: '#EAB308',
    };
    return map[color] ?? '#000';
  }

  getColorTone(color: string, tone: string): string {
    const map: Record<string, Record<string, string>> = {
      purple: { '200': '#DDD6FE', '700': '#7B5FEA' },
      blue: { '200': '#BFDBFE', '700': '#1D4ED8' },
      green: { '200': '#BBF7D0', '700': '#15803D' },
      yellow: { '200': '#FEF9C3', '700': '#A16207' },
    };
    return map[color]?.[tone] ?? '#CCC';
  }



  categorias = [
    {
      nombre: 'Ahorcado',
      icono: '🪓',
      cantidad: 2,
      colorFondo: '#F4E8FE',
      borde: '#A294F8',
      hover: 'hover:bg-[#EADDFD]'
    },
    {
      nombre: 'Rompecabezas',
      icono: '🧩',
      cantidad: 2,
      colorFondo: '#DBEAFF',
      borde: '#A294F8',
      hover: 'hover:bg-[#CFE1FF]'
    },
    {
      nombre: 'Memoria',
      icono: '🃏',
      cantidad: 2,
      colorFondo: '#DCFCE7',
      borde: '#A294F8',
      hover: 'hover:bg-[#CFFAD9]'
    },
    {
      nombre: 'Pupiletras',
      icono: '📝',
      cantidad: 2,
      colorFondo: '#FEF9C2',
      borde: '#A294F8',
      hover: 'hover:bg-[#FDF5A8]'
    }
  ];


  crearJuego(tipo: string) {
    console.log(`Crear juego de tipo: ${tipo}`);
    // Aquí iría la lógica para crear un nuevo juego
  }
}
