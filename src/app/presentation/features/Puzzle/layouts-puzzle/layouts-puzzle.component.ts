import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateGameService } from '../../../../core/infrastructure/api/create-game.service';
import { UserSessionService } from '../../../../core/infrastructure/service/user-session.service';

@Component({
  selector: 'app-layouts-puzzle',
  imports: [CommonModule, FormsModule],
  templateUrl: './layouts-puzzle.component.html',
  styleUrl: './layouts-puzzle.component.css'
})
export class LayoutsPuzzleComponent implements OnInit {
  activeTab: string = 'contenido';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Propiedades para el contenido
  tituloJuego: string = '';
  descripcion: string = '';
  filas: number = 4;
  columnas: number = 4;
  mostrarPista: boolean = false;
  pista: string = '';
  ayudaAutomatica: boolean = false;
  selectedImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  // Configuración
  fuente: string = 'Arial';
  fondo: string = 'gray';
  colorFuente: string = 'gray';
  mensajeExito: string = '¡Excelente trabajo!';
  mensajeFracaso: string = 'Inténtalo de nuevo';
  juegoPublico: boolean = true;
  tiempo: number = 180;
  dificultad: string = 'M'; // 'F' = Fácil, 'M' = Medio, 'H' = Difícil

  fonts = ['Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New'];
  colores = [
    { name: 'gray', class: 'bg-gray-400' },
    { name: 'blue', class: 'bg-blue-400' },
    { name: 'purple', class: 'bg-purple-400' },
    { name: 'rainbow', class: 'bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400' }
  ];

  userId: number = 0;

  constructor(
    private createGameService: CreateGameService,
    private userSession: UserSessionService
  ) {}

  ngOnInit(): void {
    const id = this.userSession.getUserId();
    if (id) this.userId = id;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  selectColor(tipo: 'fondo' | 'colorFuente', color: string) {
    if (tipo === 'fondo') {
      this.fondo = color;
    } else {
      this.colorFuente = color;
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    if (!this.validateImageFile(file)) {
      event.target.value = '';
      return;
    }
    this.selectedFile = file;
    this.errorMessage = '';
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage = reader.result;
    };
    reader.readAsDataURL(file);
  }

  private validateImageFile(file: File): boolean {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Tipo de archivo no permitido. Solo PNG, JPG, JPEG';
      return false;
    }
    if (file.size > 1024 * 1024) {
      this.errorMessage = 'La imagen debe ser menor a 1MB';
      return false;
    }
    return true;
  }

  private validateForm(): string[] {
    const errors: string[] = [];
    if (!this.tituloJuego || !this.tituloJuego.trim()) {
      errors.push('El título del juego es requerido');
    }
    if (!this.descripcion || !this.descripcion.trim()) {
      errors.push('La descripción es requerida');
    }
    if (!this.selectedFile) {
      errors.push('Debe seleccionar una imagen para el puzzle');
    }
    if (this.filas < 2 || this.filas > 10) {
      errors.push('Las filas deben estar entre 2 y 10');
    }
    if (this.columnas < 2 || this.columnas > 10) {
      errors.push('Las columnas deben estar entre 2 y 10');
    }
    if (this.mostrarPista && (!this.pista || !this.pista.trim())) {
      errors.push('Si activa mostrar pista, debe escribir una pista válida');
    }
    if (this.tiempo < 30) {
      errors.push('El tiempo mínimo es de 30 segundos');
    }
    return errors;
  }

  async guardar() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    const validationErrors = this.validateForm();
    if (validationErrors.length > 0) {
      this.errorMessage = validationErrors.join(', ');
      this.isLoading = false;
      return;
    }
    try {
      let pathImg = '';
      if (this.selectedFile) {
        // Lee la imagen como base64 (el resultado SIEMPRE tiene el prefijo data:image/...;base64,)
        pathImg = await this.readFileAsBase64(this.selectedFile);
      }
      const data = {
        Name: this.tituloJuego.trim(),
        Description: this.descripcion.trim(),
        Activated: true,
        Difficulty: this.dificultad,
        Visibility: this.juegoPublico ? 1 : 0,
        PathImg: pathImg,
        Clue: this.mostrarPista ? this.pista : '',
        Rows: this.filas,
        Cols: this.columnas,
        AutomaticHelp: this.ayudaAutomatica ? true : false,
        Settings: [
          { Key: 'time_limit', Value: this.tiempo.toString() },
          { Key: 'Fuente', Value: this.fuente },
          { Key: 'ColorFondo', Value: this.fondo },
          { Key: 'ColorTexto', Value: this.colorFuente },
          { Key: 'MensajeExito', Value: this.mensajeExito },
          { Key: 'MensajeFallo', Value: this.mensajeFracaso }
        ]
      };
      this.createGameService.createPuzzleGame(this.userId, { gameType: 'puzzle', data }).subscribe({
        next: () => {
          this.successMessage = '¡Puzzle guardado exitosamente!';
          this.isLoading = false;
          setTimeout(() => this.resetForm(), 2000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Error al guardar el puzzle';
          this.isLoading = false;
        }
      });
    } catch (error) {
      this.errorMessage = 'Error inesperado al procesar la imagen o los datos';
      this.isLoading = false;
    }
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        reject('Tipo de archivo no permitido. Solo PNG, JPG, JPEG');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string); // Siempre incluye el prefijo data:image/...;base64,
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  cancelar() {
    this.resetForm();
  }

  private resetForm() {
    this.tituloJuego = '';
    this.descripcion = '';
    this.filas = 4;
    this.columnas = 4;
    this.mostrarPista = false;
    this.pista = '';
    this.ayudaAutomatica = false;
    this.fuente = 'Arial';
    this.fondo = 'gray';
    this.colorFuente = 'gray';
    this.mensajeExito = '¡Excelente trabajo!';
    this.mensajeFracaso = 'Inténtalo de nuevo';
    this.juegoPublico = true;
    this.tiempo = 180;
    this.dificultad = 'M';
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedImage = null;
    this.selectedFile = null;
  }
}
