import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HangmanService } from '../../../../core/infrastructure/api/Hangman/hangman.service';
import { UserService } from '../../../../core/infrastructure/api/user.service';
import { GameInstanceService } from '../../../../core/infrastructure/api/GameInstance/game-instance.service';
import { GameCounts } from '../../../../core/domain/interface/game-count-response';
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
      icono: '🎯',
      cantidad: 0, 
      colorFondo: '#F4E8FE',
      borde: '#A294F8',
      hover: 'hover:bg-[#EADDFD]',
      ruta: 'juegos/hangman'
    },
    {
      nombre: 'Rompecabezas',
      icono: '🧩',
      cantidad: 0, 
      colorFondo: '#DBEAFF',
      borde: '#A294F8',
      hover: 'hover:bg-[#CFE1FF]',
      ruta: 'juegos/puzzle/create'
    },
    {
      nombre: 'Memoria',
      icono: '🧠',
      cantidad: 0,
      colorFondo: '#DCFCE7',
      borde: '#A294F8',
      hover: 'hover:bg-[#CFFAD9]',
      ruta: 'juegos/memory/create'
    },
    {
      nombre: 'Pupiletras',
      icono: '📝',
      cantidad: 0,
      colorFondo: '#FEF9C2',
      borde: '#A294F8',
      hover: 'hover:bg-[#FDF5A8]',
      ruta: 'juegos/solve-The-Word/create'
    }
  ];

  private currentProfessorId: number = 0;

  constructor(
    private router: Router,
    private hangmanService: HangmanService,
    private userService: UserService,
    private gameInstanceService: GameInstanceService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private async loadUserData(): Promise<void> {
    try {
      const userString = sessionStorage.getItem('user');
      if (!userString) {
        throw new Error('No hay usuario en sesión');
      }
      
      const user = JSON.parse(userString);
      const email = user?.Email;
      if (!email) {
        throw new Error('El usuario no tiene email registrado');
      }

      // Usar Promise para esperar la respuesta del servicio
      this.userService.findUserByEmail(email).subscribe({
        next: (response) => {
          if (response?.data?.Id) {
            this.currentProfessorId = response.data.Id;
            console.log('ID del profesor obtenido:', this.currentProfessorId);
            // Cargar datos de juegos DESPUÉS de obtener el ID
            this.cargarDatosJuegos();
          } else {
            throw new Error('ID de usuario no válido');
          }
        },
        error: (error) => {
          console.error('Error al obtener usuario:', error);
          this.error = true;
          this.cargando = false;
        }
      });
      
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      this.error = true;
      this.cargando = false;
    }
  }

  cargarDatosJuegos(): void {
  if (this.currentProfessorId === 0) {
    console.error('ID del profesor no válido');
    this.error = true;
    this.cargando = false;
    return;
  }

  this.cargando = true;
  this.error = false;

  // Usar el nuevo servicio para obtener todos los contadores de una vez
  this.gameInstanceService.getGameCountsByProfessor(this.currentProfessorId).subscribe({
    next: (counts: GameCounts) => {
      console.log('Conteos obtenidos:', counts);

      // Actualizar contadores
      this.contadores.Ahorcado = counts.hangman;
      this.contadores.Rompecabezas = counts.puzzle;
      this.contadores.Memoria = counts.memory;
      this.contadores.Pupiletras = counts.solve_the_word;

      // Actualizar categorías
      this.categorias.forEach(categoria => {
        switch(categoria.nombre) {
          case 'Ahorcado':
            categoria.cantidad = counts.hangman;
            break;
          case 'Rompecabezas':
            categoria.cantidad = counts.puzzle;
            break;
          case 'Memoria':
            categoria.cantidad = counts.memory;
            break;
          case 'Pupiletras':
            categoria.cantidad = counts.solve_the_word;
            break;
        }
      });

      // Forzar detección de cambios
      this.categorias = [...this.categorias];

      console.log('Categorías actualizadas:', this.categorias);
      console.log('Contadores actualizados:', this.contadores);
      
      this.cargando = false;
    },
    error: (err) => {
      console.error('Error al cargar conteos de juegos:', err);
      this.error = true;
      this.cargando = false;
    }
  });
}

  crearJuego(ruta: string) {
    if (ruta) {
      this.router.navigate([ruta]);
    } else {
      console.error('No se definió ruta para este juego');
    }
  }

  // Método para recargar datos manualmente
  recargarDatos(): void {
    this.loadUserData();
  }

  // Método de prueba para verificar que el binding funciona
  probarContador(): void {
    this.categorias[0].cantidad = Math.floor(Math.random() * 10) + 1;
    this.contadores.Ahorcado = this.categorias[0].cantidad;
    console.log('Contador de prueba actualizado:', this.categorias[0].cantidad);
  }
}