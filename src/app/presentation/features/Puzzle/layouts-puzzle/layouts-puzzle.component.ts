import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormGroup, FormsModule} from '@angular/forms';
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
  imagenUrl: string = ''; 
  selectedImage: string | ArrayBuffer | null = null; 
  selectedFile: File | null = null; 

  // Propiedades para la configuración
  fuente: string = 'Arial';
  fondo: string = 'gray';
  colorFuente: string = 'gray';
  mensajeExito: string = '¡Excelente trabajo!';
  mensajeFracaso: string = 'Inténtalo de nuevo';
  juegoPublico: boolean = true;
  tiempo: number = 180;
  dificultad: Difficulty = Difficulty.EASY;

  // Opciones para configuración
  fonts = ['Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New'];

  // Forms
  configForm!: FormGroup;

  // Opciones de colores
  colores = [
    { name: 'gray', class: 'bg-gray-400' },
    { name: 'blue', class: 'bg-blue-400' },
    { name: 'purple', class: 'bg-purple-400' },
    { name: 'rainbow', class: 'bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400' }
  ];


  // Getters para los controles del formulario
  get successMessageControl() {
    return this.configForm.get('successMessage');
  }
  get failureMessageControl() {
    return this.configForm.get('failureMessage');
  }
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
    
    // IMPORTANTE: La ruta debe ser la ruta COMPLETA del dispositivo como solicitas
    // La construcción de la ruta completa basada en tu PATH_UPLOAD_FILES
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `puzzle_${timestamp}.${fileExtension}`;
    
    // Esta es la ruta completa que se enviará al backend
    this.imagenUrl = `/storage/puzzles/${uniqueFileName}`;    
    console.log('📁 Archivo procesado:', {
      nombre: file.name,
      tamaño: `${(file.size / 1024).toFixed(2)} KB`,
      tipo: file.type,
      rutaCompleta: this.imagenUrl
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

    // ⭐ Validación más estricta del título
    if (!this.tituloJuego || !this.tituloJuego.trim()) {
      errors.push('El título del juego es requerido y no puede estar vacío');
    } else if (this.tituloJuego.trim().length < 3) {
      errors.push('El título debe tener al menos 3 caracteres');
    }

    // ⭐ Validación más estricta de la descripción
    if (!this.descripcion || !this.descripcion.trim()) {
      errors.push('La descripción es requerida y no puede estar vacía');
    } else if (this.descripcion.trim().length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
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

    // Validar que la imagen no exceda 1MB
    if (this.selectedFile && this.selectedFile.size > 1024 * 1024) {
      errors.push('La imagen debe ser menor a 1MB');
    }

    // ⭐ Debug de validación
    console.log('🔍 Validación de campos:', {
      tituloJuego: this.tituloJuego,
      tituloJuegoTrimmed: this.tituloJuego?.trim(),
      descripcion: this.descripcion,
      descripcionTrimmed: this.descripcion?.trim(),
      selectedFile: !!this.selectedFile,
      errorsFound: errors.length
    });

    return errors;
  }

  private buildGameData(): CreateGame {
    const settings: GameSetting[] = [
      {
        ConfigKey: 'Tiempo',
        ConfigValue: this.tiempo.toString()
      },
      {
        ConfigKey: 'Fuente',
        ConfigValue: this.fuente
      },
      {
        ConfigKey: 'ColorFuente',
        ConfigValue: this.colorFuente
      },
      {
        ConfigKey: 'ColorFondo',
        ConfigValue: this.fondo
      },
      {
        ConfigKey: 'MensajeExito',
        ConfigValue: this.mensajeExito
      },
      {
        ConfigKey: 'MensajeFracaso',
        ConfigValue: this.mensajeFracaso
      }
    ];

    const assessment: Assessment = {
      value: 5,
      comments: `Puzzle de ${this.filas}x${this.columnas} piezas - ${this.getDifficultyText()}`
    };

    const puzzleData: PuzzleData = {
      image_url: this.imagenUrl,
      clue: this.mostrarPista ? this.pista : '',
      rows: this.filas,
      columns: this.columnas,
      automatic_help: this.ayudaAutomatica
    };

    const gameData: CreateGame = {
      Name: this.tituloJuego,
      Description: this.descripcion,
      ProfessorId: 4, //Falta implementar la lógica para obtener el ID del profesor
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

    // ⭐ Debug inicial
    console.log('🚀 Iniciando guardado con valores:', {
      tituloJuego: this.tituloJuego,
      descripcion: this.descripcion,
      selectedFile: this.selectedFile?.name
    });

    // Validar formulario
    const validationErrors = this.validateForm();
    if (validationErrors.length > 0) {
      this.errorMessage = validationErrors.join(', ');
      this.isLoading = false;
      console.error('❌ Errores de validación:', validationErrors);
      return;
    }

    try {
      // Construir el objeto de datos del juego (JSON plano)
      const gameData = this.buildGameData();
      // Llamar al servicio que envía el JSON plano
      this.gameService.createGame(gameData).subscribe({
        next: (response: GameInstance) => {
          console.log('✅ Juego creado exitosamente:', response);
          this.successMessage = '¡Puzzle guardado exitosamente!';
          this.isLoading = false;
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


  private buildGameDataWithoutImageUrl(): CreateGame {
  const settings: GameSetting[] = [
    {
      ConfigKey: 'Tiempo',
      ConfigValue: this.tiempo.toString()
    },
    {
      ConfigKey: 'Fuente',
      ConfigValue: this.fuente || 'Arial' // Valor por defecto
    },
    {
      ConfigKey: 'ColorFuente',
      ConfigValue: this.colorFuente
    },
    {
      ConfigKey: 'ColorFondo',
      ConfigValue: this.fondo
    },
    {
      ConfigKey: 'MensajeExito',
      ConfigValue: this.mensajeExito || '¡Excelente trabajo!' // Valor por defecto
    },
    {
      ConfigKey: 'MensajeFracaso',
      ConfigValue: this.mensajeFracaso || 'Inténtalo de nuevo' // Valor por defecto
    }
  ];

  const assessment: Assessment = {
    value: 5,
    comments: `Puzzle de ${this.filas}x${this.columnas} piezas - ${this.getDifficultyText()}`
  };

  const puzzleData: PuzzleData = {
    image_url: '', // Se llenará en el backend
    clue: this.mostrarPista ? this.pista : '',
    rows: this.filas,
    columns: this.columnas,
    automatic_help: this.ayudaAutomatica
  };

  const gameData: CreateGame = {
    Name: this.tituloJuego.trim(), // ⭐ ASEGURAR QUE NO ESTÉ VACÍO
    Description: this.descripcion.trim(), // ⭐ ASEGURAR QUE NO ESTÉ VACÍO
    ProfessorId: 4,
    Activated: true,
    Difficulty: this.dificultad,
    Visibility: this.juegoPublico ? Visibility.PUBLIC : Visibility.PRIVATE,
    game_type: GameType.PUZZLE,
    settings: settings,
    assessment: assessment,
    puzzle: puzzleData
  };

  // ⭐ DEBUG: Verificar que Name no sea null/undefined/vacío
  console.log('🔍 Datos del juego construidos:', {
    Name: gameData.Name,
    Description: gameData.Description,
    completeData: gameData
  });

  return gameData;
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
        bgPosition: `${-col * (100 / (this.columnas || 4))}% ${-row * (100 / (this.filas || 4))}%`
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

  getDifficultyIcon(): string {
    switch (this.dificultad) {
      case Difficulty.EASY: return '🟢';
      case Difficulty.MEDIUM: return '🟡';
      case Difficulty.HARD: return '🔴';
      default: return '🟢';
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
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


// Método para enviar el formulario con el archivo
enviarFormularioConArchivo() {
  // Validar que haya un archivo seleccionado
  if (!this.selectedFile) {
    this.errorMessage = 'Debe seleccionar un archivo para enviar';
    return;
  }

  // Construir el objeto de datos del juego
  const gameData = this.buildGameData();

  // Crear un FormData para enviar el archivo y los datos del juego
  const formData = new FormData();
  formData.append('files', this.selectedFile);
  formData.append('Name', gameData.Name);
  formData.append('Description', gameData.Description);
  formData.append('ProfessorId', gameData.ProfessorId.toString());
  formData.append('Activated', gameData.Activated.toString());
  formData.append('Difficulty', gameData.Difficulty.toString());
  formData.append('Visibility', gameData.Visibility.toString());
  formData.append('game_type', gameData.game_type.toString());
  formData.append('settings', JSON.stringify(gameData.settings));
  formData.append('assessment', JSON.stringify(gameData.assessment));
  formData.append('puzzle', JSON.stringify(gameData.puzzle));

  // Enviar los datos usando el servicio de juego
this.gameService.createPuzzleGameWithFile(formData).subscribe({
      next: (response: GameInstance) => {
      console.log('✅ Juego creado exitosamente:', response);
      this.successMessage = '¡Puzzle guardado exitosamente!';
      this.isLoading = false;
      setTimeout(() => this.resetForm(), 2000);
    },
    error: (error) => {
      console.error('❌ Error al guardar:', error);
      this.errorMessage = error.message || 'Error al guardar el puzzle';
      this.isLoading = false;
    }
  });
}

}
