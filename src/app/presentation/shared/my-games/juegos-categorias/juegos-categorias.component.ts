import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HangmanService } from '../../../../core/infrastructure/api/Hangman/hangman.service';
import { Hangman } from '../../../../core/domain/model/hangman/hangman';
import { UserService } from '../../../../core/infrastructure/api/user.service';

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
    private userService: UserService
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

    // Cargar datos de Ahorcado
    this.hangmanService.getAllHangman(this.currentProfessorId).subscribe({
      next: (response) => {
        console.log('Respuesta completa del servicio hangman:', response);
        
        let juegos: Hangman[] = [];
        let cantidadJuegos = 0;

        // Manejar diferentes formatos de respuesta
        if (response && response.status === 'success' && response.data) {
          juegos = Array.isArray(response.data) ? response.data : [];
          cantidadJuegos = juegos.length;
        } else if (Array.isArray(response)) {
          juegos = response;
          cantidadJuegos = juegos.length;
        } else if (response && typeof response === 'object') {
          // Si viene como objeto, intentar extraer la data
          cantidadJuegos = response.length || 0;
        } else {
          console.warn('Formato de respuesta inesperado:', response);
          cantidadJuegos = 0;
        }

        console.log('Cantidad de juegos detectada:', cantidadJuegos);

        // Actualizar contador
        this.contadores.Ahorcado = cantidadJuegos;

        // Actualizar la categoría correspondiente usando el índice
        const indiceAhorcado = this.categorias.findIndex(c => c.nombre === 'Ahorcado');
        if (indiceAhorcado !== -1) {
          this.categorias[indiceAhorcado].cantidad = cantidadJuegos;
          console.log('Categoría Ahorcado actualizada:', this.categorias[indiceAhorcado]);
        }

        // Forzar detección de cambios
        this.categorias = [...this.categorias];

        console.log('Estado final de categorias:', this.categorias);
        console.log('Estado final de contadores:', this.contadores);
        
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar juegos de Ahorcado:', err);
        this.error = true;
        this.cargando = false;
      }
    });

    // Aquí puedes agregar llamadas para cargar los otros tipos de juegos
    // this.loadPuzzleGames();
    // this.loadMemoryGames();
    // this.loadWordSearchGames();
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