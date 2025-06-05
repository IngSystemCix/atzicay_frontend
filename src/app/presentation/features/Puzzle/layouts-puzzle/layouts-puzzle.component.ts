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

  constructor(private gameService: GameService) {}

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
  
    // Validar archivo antes de procesarlo
    if (!this.validateImageFile(file)) {
      event.target.value = '';
      return;
    }
  
    this.selectedFile = file;
    this.errorMessage = '';
    
    // Para preview, usar FileReader
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage = reader.result;
    };
    reader.readAsDataURL(file);
    
    // Generar nombre único y guardar la imagen localmente
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `puzzle_${timestamp}.${fileExtension}`;
    
    // Guardar imagen en assets localmente
    this.saveImageToAssets(file, uniqueFileName);
    
    // Esta será la URL que se envía al backend
    this.imagenUrl = `assets/${uniqueFileName}`;
    
    console.log('📁 Archivo procesado:', {
      nombre: file.name,
      tamaño: `${(file.size / 1024).toFixed(2)} KB`,
      tipo: file.type,
      rutaDestino: this.imagenUrl
    });
  }

  private saveImageToAssets(file: File, fileName: string): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      // Guardar en localStorage temporalmente para transferir al assets
      localStorage.setItem(`temp_image_${fileName}`, base64Data);
      
      // En un proyecto real, aquí harías una llamada a tu backend local
      // para que guarde el archivo en public/assets
      console.log(`💾 Imagen guardada temporalmente como: ${fileName}`);
    };
    reader.readAsDataURL(file);
  }
  

  private async saveImageToFolder(): Promise<boolean> {
    if (!this.selectedFile) {
      console.error('No hay archivo seleccionado');
      return false;
    }
  
    try {
      // En lugar de subir a un endpoint, guardamos localmente
      console.log('✅ Imagen lista para usar:', this.imagenUrl);
      return true;
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
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
  
    // Agregar configuraciones adicionales
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
      value: 5,
      comments: `Puzzle de ${this.filas}x${this.columnas} piezas - ${this.getDifficultyText()}`
    };
  
    const puzzleData: PuzzleData = {
      image_url: this.imagenUrl, // Esta es la ruta que va al backend
      clue: this.mostrarPista ? this.pista : '',
      rows: this.filas,
      columns: this.columnas,
      automatic_help: this.ayudaAutomatica
    };
  
    const gameData: CreateGame = {
      Name: this.tituloJuego,
      Description: this.descripcion,
      ProfessorId: 4, // Considera hacer esto dinámico
      Activated: true,
      Difficulty: this.dificultad,
      Visibility: this.juegoPublico ? Visibility.PUBLIC : Visibility.PRIVATE,
      game_type: GameType.PUZZLE,
      settings: settings,
      assessment: assessment,
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
  
    try {
      // Primero subir la imagen
      const imagenGuardada = await this.saveImageToFolder();
      if (!imagenGuardada) {
        this.errorMessage = 'No se pudo guardar la imagen en el servidor';
        this.isLoading = false;
        return;
      }
  
      // Luego crear el juego
      const gameData = this.buildGameData();
      console.log('📤 Enviando datos al backend:', JSON.stringify(gameData, null, 2));
  
      this.gameService.createPuzzleGame(gameData, gameData.puzzle!).subscribe({
        next: (response: GameInstance) => {
          console.log('✅ Juego creado exitosamente:', response);
          this.successMessage = '¡Puzzle guardado exitosamente!';
          this.isLoading = false;
          
          // Limpiar localStorage si se usó
          localStorage.removeItem('miImagenPuzzle');
          
          setTimeout(() => this.resetForm(), 2000);
        },
        error: (error) => {
          console.error('❌ Error al guardar:', error);
          this.errorMessage = error.message || 'Error al guardar el puzzle';
          this.isLoading = false;
        }
      });
  
    } catch (error) {
      console.error('❌ Error general:', error);
      this.errorMessage = 'Error inesperado al procesar la solicitud';
      this.isLoading = false;
    }
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
    this.mostrarJsonDebug = false;
    this.jsonDebug = {};
  }

  getPuzzlePieces(): any[] {
    const totalPieces = (this.filas || 4) * (this.columnas || 4);
    const pieces = [];
    
    for (let i = 0; i < totalPieces; i++) {
      const row = Math.floor(i / (this.columnas || 4));
      const col = i % (this.columnas || 4);
      
      pieces.push({
        id: i,
        bgPosition: `${-col * 100}% ${-row * 100}%`
      });
    }
    
    return pieces;
  }
  
  getDifficultyText(): string {
    switch (this.dificultad) {
      case Difficulty.EASY: return 'Fácil';
      case Difficulty.MEDIUM: return 'Medio';
      case Difficulty.HARD: return 'Difícil';
      default: return 'Fácil';
    }
  }

  // Para mostrar el modal JSON
mostrarJsonDebug: boolean = false;
jsonDebug: any = {};

mostrarDebugJson() {
  if (!this.mostrarJsonDebug) {
    // Actualizar el JSON cada vez que se abre el modal
    this.jsonDebug = this.armarJsonParaEnviar();
  }
  this.mostrarJsonDebug = !this.mostrarJsonDebug;
}

private validateImageFile(file: File): boolean {
  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    this.errorMessage = 'Tipo de archivo no permitido. Use JPG, PNG, GIF o WEBP';
    return false;
  }

  // Validar tamaño (1MB = 1024 * 1024 bytes)
  const maxSize = 1024 * 1024; // 1MB
  if (file.size > maxSize) {
    this.errorMessage = 'La imagen debe ser menor a 1MB';
    return false;
  }

  return true;
}

// Esta función debería coincidir con la estructura que envías a tu backend
armarJsonParaEnviar() {
  const gameData = this.buildGameData();
  
  // Retornar exactamente el mismo JSON que se envía al backend
  return {
    "Name": gameData.Name,
    "Description": gameData.Description,
    "ProfessorId": gameData.ProfessorId,
    "Activated": gameData.Activated,
    "Difficulty": gameData.Difficulty,
    "Visibility": gameData.Visibility,
    "game_type": gameData.game_type,
    "settings": gameData.settings,
    "assessment": gameData.assessment,
    "puzzle": gameData.puzzle
  };
}

copiarJson(): void {
  const jsonString = JSON.stringify(this.jsonDebug, null, 2);
  navigator.clipboard.writeText(jsonString).then(() => {
    // Mostrar mensaje temporal de copiado
    const originalText = this.successMessage;
    this.successMessage = 'JSON copiado al portapapeles';
    setTimeout(() => {
      this.successMessage = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Error al copiar:', err);
  });
}

}
