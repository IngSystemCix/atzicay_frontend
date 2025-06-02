import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Difficulty} from '../../../../core/domain/enum/difficulty';
import {GameService} from '../../../../core/infrastructure/api/createGame/game.service';
import {CreateGame} from '../../../../core/domain/interface/create-game';
import {GameSetting} from '../../../../core/domain/interface/game-setting';
import {Assessment} from '../../../../core/domain/interface/assessment';
import {PuzzleData} from '../../../../core/domain/interface/puzzle-data';
import {Visibility} from '../../../../core/domain/enum/visibility';
import {GameInstance} from '../../../../core/domain/interface/game-instance';
import {GameType} from '../../../../core/domain/enum/game-type';
import {FileUploadService} from '../../../../core/infrastructure/service/file-upload.service';

@Component({
  selector: 'app-layouts-puzzle',
  imports: [CommonModule, FormsModule],
  templateUrl: './layouts-puzzle.component.html',
  styleUrl: './layouts-puzzle.component.css'
})
export class LayoutsPuzzleComponent {
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
  imagenUrl: string = ''; // Aquí se guardará la ruta de la imagen
  selectedImage: string | ArrayBuffer | null = null; // Para preview
  selectedFile: File | null = null; // El archivo seleccionado

  // Propiedades para la configuración
  fuente: string = '';
  fondo: string = 'gray';
  colorFuente: string = 'gray';
  mensajeExito: string = '';
  mensajeFracaso: string = '';
  juegoPublico: boolean = false;
  tiempo: number = 180;
  dificultad: Difficulty = Difficulty.EASY;

  // Opciones de colores
  colores = [
    { name: 'gray', class: 'bg-gray-400' },
    { name: 'blue', class: 'bg-blue-400' },
    { name: 'purple', class: 'bg-purple-400' },
    { name: 'rainbow', class: 'bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400' }
  ];

  // Enums para el template
  Difficulty = Difficulty;

  constructor(private gameService: GameService, private fileUploadService: FileUploadService) {}

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
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Crear preview para mostrar al usuario
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      // Generar nombre único para la imagen
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `puzzle_${timestamp}.${fileExtension}`;

      // Establecer la ruta donde se guardará la imagen
      this.imagenUrl = uniqueFileName; // Solo el nombre del archivo


      console.log('Archivo seleccionado:', file.name);
      console.log('Ruta de destino:', this.imagenUrl);
    }
  }

  private async saveImageToFolder(): Promise<boolean> {
    if (!this.selectedFile) {
      return false;
    }

    try {
      // OPCIÓN 1: Si tienes un servicio de subida de archivos
      // const formData = new FormData();
      // formData.append('image', this.selectedFile);
      // formData.append('destination', 'src/app/public/puzzle/');
      // await this.fileUploadService.uploadImage(formData).toPromise();

      // OPCIÓN 2: Por ahora simular que se guardó (para desarrollo)
      // Aquí podrías implementar la lógica de guardado local si es necesario
      console.log('Imagen preparada para guardar en:', this.imagenUrl);

      // Simular delay de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));

      return true;

    } catch (error) {
      console.error('Error al guardar la imagen:', error);
      return false;
    }
  }

  private validateForm(): string[] {
    const errors: string[] = [];

    if (!this.tituloJuego.trim()) {
      errors.push('El título del juego es requerido');
    }

    if (!this.descripcion.trim()) {
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

    if (this.mostrarPista && !this.pista.trim()) {
      errors.push('Si activa mostrar pista, debe escribir una pista');
    }

    if (this.tiempo < 30) {
      errors.push('El tiempo mínimo es de 30 segundos');
    }

    return errors;
  }

  private buildGameData(): CreateGame {
    const settings: GameSetting[] = [
      {
        ConfigKey: 'Tiempo',
        ConfigValue: this.tiempo.toString()
      }
    ];

    // Agregar configuraciones adicionales si es necesario
    if (this.fuente.trim()) {
      settings.push({
        ConfigKey: 'Fuente',
        ConfigValue: this.fuente
      });
    }

    if (this.mensajeExito.trim()) {
      settings.push({
        ConfigKey: 'MensajeExito',
        ConfigValue: this.mensajeExito
      });
    }

    if (this.mensajeFracaso.trim()) {
      settings.push({
        ConfigKey: 'MensajeFracaso',
        ConfigValue: this.mensajeFracaso
      });
    }

    const assessment: Assessment = {
      value: 5, // Valor por defecto
      comments: `Puzzle de ${this.filas}x${this.columnas} piezas`
    };

    // Aquí enviamos solo la ruta de la imagen como string
    const puzzleData: PuzzleData = {
      image_url: this.imagenUrl, // Ruta de la imagen como string
      clue: this.mostrarPista ? this.pista : '',
      rows: this.filas,
      columns: this.columnas,
      automatic_help: this.ayudaAutomatica
    };

    console.log('Datos del puzzle:', puzzleData);
    console.log('Ruta de imagen enviada:', this.imagenUrl);

    const gameData: CreateGame = {
      Name: this.tituloJuego,
      Description: this.descripcion,
      ProfessorId: 1,
      Activated: true,
      Difficulty: this.dificultad,
      Visibility: this.juegoPublico ? Visibility.PUBLIC : Visibility.PRIVATE,
      settings: settings,
      assessment: assessment,
      game_type: GameType.PUZZLE,
      puzzle: puzzleData
    };

    return gameData;
  }

  async guardar() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Validar formulario
    const validationErrors = this.validateForm();
    if (validationErrors.length > 0) {
      this.errorMessage = validationErrors.join(', ');
      this.isLoading = false;
      return;
    }

    // Intentar guardar la imagen primero
    // const imageSaved = await this.saveImageToFolder();
    // if (!imageSaved) {
    //   this.errorMessage = 'Error al guardar la imagen';
    //   this.isLoading = false;
    //   return;
    // }

    const gameData = this.buildGameData();

    // Validar datos del juego
    const gameValidationErrors = this.gameService.validateGameData(gameData);
    if (gameValidationErrors.length > 0) {
      this.errorMessage = gameValidationErrors.join(', ');
      this.isLoading = false;
      return;
    }

    console.log('Datos listos para enviar:', gameData);

    this.gameService.createPuzzleGame(gameData, gameData.puzzle!).subscribe({
      next: (response: GameInstance) => {
        console.log('✅ Juego creado exitosamente:', response);
        this.successMessage = '¡Puzzle guardado exitosamente!';
        this.isLoading = false;
        // Opcional: resetear formulario después de un tiempo
        setTimeout(() => this.resetForm(), 2000);
      },
      error: (error) => {
        console.error('❌ Error al guardar:', error);
        this.errorMessage = error.message || 'Error al guardar el puzzle';
        this.isLoading = false;
      }
    });
  }

  cancelar() {
    // Lógica para cancelar
    this.resetForm();
    console.log('Cancelar');
  }

  private resetForm() {
    this.tituloJuego = '';
    this.descripcion = '';
    this.filas = 4;
    this.columnas = 4;
    this.mostrarPista = false;
    this.pista = '';
    this.ayudaAutomatica = false;
    this.fuente = '';
    this.fondo = 'gray';
    this.colorFuente = 'gray';
    this.mensajeExito = '';
    this.mensajeFracaso = '';
    this.juegoPublico = false;
    this.tiempo = 180;
    this.dificultad = Difficulty.EASY;
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedImage = null;
    this.selectedFile = null;
    this.imagenUrl = '';
  }
}
