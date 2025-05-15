import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HangmanService } from '../../../../core/infrastructure/api/Hangman/hangman.service';
import { Hangman } from '../../../../core/domain/model/hangman/hangman';

// Importar aquí otros servicios de juegos cuando estén disponibles
// import { PuzzleService } from '../../services/puzzle/puzzle.service';
// import { MemoryService } from '../../services/memory/memory.service';
// import { WordSearchService } from '../../services/wordsearch/wordsearch.service';

@Component({
  selector: 'app-juegos-categorias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './juegos-categorias.component.html',
  styleUrl: './juegos-categorias.component.css'
})
export class JuegosCategoriasComponent implements OnInit {
  // Contador para cada tipo de juego
  contadores = {
    Ahorcado: 0,
    Rompecabezas: 0,
    Memoria: 0,
    Pupiletras: 0
  };

  // Datos cargando
  cargando = true;
  error = false;

  categorias = [
    {
      nombre: 'Ahorcado',
      icono: '🪓',
      cantidad: 0, // Se actualizará con datos reales
      colorFondo: '#F4E8FE',
      borde: '#A294F8',
      hover: 'hover:bg-[#EADDFD]',
      ruta: 'juegos/create-hangman'
    },
    {
      nombre: 'Rompecabezas',
      icono: '🧩',
      cantidad: 0, // Se actualizará con datos reales
      colorFondo: '#DBEAFF',
      borde: '#A294F8',
      hover: 'hover:bg-[#CFE1FF]',
      ruta: ''
    },
    {
      nombre: 'Memoria',
      icono: '🃏',
      cantidad: 0, // Se actualizará con datos reales
      colorFondo: '#DCFCE7',
      borde: '#A294F8',
      hover: 'hover:bg-[#CFFAD9]',
      ruta: ''
    },
    {
      nombre: 'Pupiletras',
      icono: '📝',
      cantidad: 0, // Se actualizará con datos reales
      colorFondo: '#FEF9C2',
      borde: '#A294F8',
      hover: 'hover:bg-[#FDF5A8]',
      ruta: ''
    }
  ];

  constructor(
    private router: Router,
    private hangmanService: HangmanService,
    // Inyectar aquí otros servicios cuando estén disponibles
    // private puzzleService: PuzzleService,
    // private memoryService: MemoryService,
    // private wordSearchService: WordSearchService
  ) {}

  ngOnInit(): void {
    this.cargarDatosJuegos();
  }

  cargarDatosJuegos(): void {
    this.cargando = true;
    
    // Cargar datos de Ahorcado
    this.hangmanService.getAllHangman().subscribe({
      next: (response) => {
        // Verificar si la respuesta viene en formato API
        let juegos: Hangman[] = [];
        
        if (response && response.status === 'success' && response.data) {
          // Si viene en el formato API que mostraste
          juegos = response.data;
        } else {
          // Si viene directamente como array de Hangman
          juegos = response as Hangman[];
        }
        
        this.contadores.Ahorcado = juegos.length;
        
        // Actualizar la categoría correspondiente
        const categoriaAhorcado = this.categorias.find(c => c.nombre === 'Ahorcado');
        if (categoriaAhorcado) {
          categoriaAhorcado.cantidad = juegos.length;
        }
        
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar juegos de Ahorcado:', err);
        this.error = true;
        this.cargando = false;
      }
    });

    // Aquí agregarías la carga de los demás tipos de juegos cuando tengas los servicios
    // Por ahora dejamos los contadores en 0 para las demás categorías
    
    /* Ejemplo para cuando tengas los demás servicios:
    
    this.puzzleService.getAllPuzzles().subscribe({
      next: (puzzles) => {
        this.contadores.Rompecabezas = puzzles.length;
        const categoriaPuzzle = this.categorias.find(c => c.nombre === 'Rompecabezas');
        if (categoriaPuzzle) {
          categoriaPuzzle.cantidad = puzzles.length;
        }
      },
      error: (err) => {
        console.error('Error al cargar Rompecabezas:', err);
      }
    });
    
    */
  }

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

  crearJuego(tipo: string) {
    console.log(`Crear juego de tipo: ${tipo}`);

    // Encuentra la categoría correspondiente
    const categoria = this.categorias.find(cat => cat.nombre === tipo);

    // Si la categoría tiene una ruta definida, navega a ella
    if (categoria && categoria.ruta) {
      this.router.navigate([categoria.ruta]);
    } else {
      // Aquí podría ir la lógica para otros tipos de juegos
      console.log('Ruta no definida para este tipo de juego');
    }
  }
}