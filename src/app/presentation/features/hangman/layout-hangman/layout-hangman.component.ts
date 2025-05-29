import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CreateGame } from '../../../../core/domain/interface/create-game';
import { GameType } from '../../../../core/domain/enum/game-type';
import { GameService } from '../../../../core/infrastructure/api/createGame/game.service';
import { Difficulty } from '../../../../core/domain/enum/difficulty';
import { Visibility } from '../../../../core/domain/enum/visibility';
import {HangmanData} from '../../../../core/domain/interface/hangman-data';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-layout-hangman',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './layout-hangman.component.html',
  styleUrls: ['./layout-hangman.component.css']
})
export class LayoutHangmanComponent implements OnInit {
  // Control de tabs
  activeTab: 'content' | 'config' | 'preview' = 'content';

  // Control de pistas
  showClues: boolean = true;

  // Forms
  hangmanForm!: FormGroup;
  wordsForm!: FormGroup;
  configForm!: FormGroup;

  // Estados
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  // Opciones para configuración
  themes = ['Claro', 'Oscuro', 'Azul', 'Verde'];
  fonts = ['Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New'];

  constructor(
    private fb: FormBuilder,
    private gameService: GameService,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    // Agregar una palabra inicial
    this.addNewWord();
  }

  private initializeForms(): void {
    // Formulario principal del juego
    this.hangmanForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      professorId: [1, [Validators.required, Validators.min(1)]], // Aquí usas string '1' en lugar de número
      difficulty: ['', Validators.required],
      visibility: ['', Validators.required],
      presentation: ['', Validators.required]
    });

    // Formulario de palabras
    this.wordsForm = this.fb.group({
      words: this.fb.array([])
    });

    // Formulario de configuración - sin valores por defecto
    this.configForm = this.fb.group({
      timeLimit: [60, [Validators.required, Validators.min(10), Validators.max(300)]],
      theme: ['Claro', Validators.required],
      font: ['Arial', Validators.required],
      backgroundColor: ['#ffffff', Validators.required],
      fontColor: ['#000000', Validators.required],
      successMessage: ['¡Excelente trabajo!', [Validators.required, Validators.minLength(3)]],
      failureMessage: ['Inténtalo de nuevo', [Validators.required, Validators.minLength(3)]],
      assessmentValue: [0.8, [Validators.required, Validators.min(0), Validators.max(1)]],
      assessmentComments: ['Buen desafío para principiantes.', [Validators.required, Validators.minLength(5)]],
      publicGame: [false]
    });
  }
  // Getters para formularios
  get wordsArray(): FormArray {
    return this.wordsForm.get('words') as FormArray;
  }

  get timeLimit() { return this.configForm.get('timeLimit'); }
  get backgroundColor() { return this.configForm.get('backgroundColor'); }
  get fontColor() { return this.configForm.get('fontColor'); }
  get successMessageControl() { return this.configForm.get('successMessage'); }
  get failureMessageControl() { return this.configForm.get('failureMessage'); }

  // Métodos para tabs
  setActiveTab(tab: 'content' | 'config' | 'preview'): void {
    this.activeTab = tab;
  }

  // Métodos para palabras
  addNewWord(): void {
    const wordForm = this.fb.group({
      word: ['', [Validators.required, Validators.minLength(2)]],
      clue: [
        { value: '', disabled: !this.showClues }, // Usar la sintaxis correcta para disabled
        this.showClues ? [Validators.required, Validators.minLength(5)] : []
      ]
    });
    this.wordsArray.push(wordForm);
  }

  removeWord(index: number): void {
    if (this.wordsArray.length > 1) {
      this.wordsArray.removeAt(index);
    } else {
      this.showError('Se requiere al menos una palabra para el juego.');
    }
  }

  toggleShowClues(): void {
    this.showClues = !this.showClues;

    this.wordsArray.controls.forEach(control => {
      const clueControl = control.get('clue');
      if (clueControl) {
        if (this.showClues) {
          clueControl.enable();
          clueControl.setValidators([Validators.required, Validators.minLength(5)]);
        } else {
          clueControl.disable();
          clueControl.clearValidators();
          clueControl.setValue('');
        }
        clueControl.updateValueAndValidity();
      }
    });
  }

  // Métodos para configuración
  onColorChange(field: string, color: string): void {
    this.configForm.get(field)?.setValue(color);
  }

  // Validaciones
  private isFormValid(): boolean {
    const isHangmanValid = this.hangmanForm.valid;
    const isWordsValid = this.wordsForm.valid && this.wordsArray.length > 0;
    const isConfigValid = this.configForm.valid;
    console.log('Validación de formularios:', {
      hangman: isHangmanValid,
      words: isWordsValid,
      config: isConfigValid,
      wordsCount: this.wordsArray.length
    });
    return isHangmanValid && isWordsValid && isConfigValid;
  }

  private markAllAsTouched(): void {
    this.hangmanForm.markAllAsTouched();
    this.configForm.markAllAsTouched();
    this.wordsArray.controls.forEach(control => {
      control.markAllAsTouched();
    });
  }

  // Getters para facilitar el acceso en el template
  get isNameInvalid(): boolean {
    const control = this.hangmanForm.get('name');
    return !!(control && control.invalid && control.touched);
  }

  get isDescriptionInvalid(): boolean {
    const control = this.hangmanForm.get('description');
    return !!(control && control.invalid && control.touched);
  }

  isWordInvalid(index: number): boolean {
    const control = this.wordsArray.at(index)?.get('word');
    return !!(control && control.invalid && control.touched);
  }

  isClueInvalid(index: number): boolean {
    if (!this.showClues) return false;
    const control = this.wordsArray.at(index)?.get('clue');
    return !!(control && control.invalid && control.touched);
  }

  // Preparar datos para envío
  private prepareFormDataToSend() {
    const hangmanData = this.hangmanForm.value;
    const configData = this.configForm.value;

    // Obtener todas las palabras
    const words = this.wordsArray.controls.map(control => ({
      word: control.get('word')?.value?.trim(),
      clue: control.get('clue')?.value?.trim()
    })).filter(w => w.word && w.word.length >= 2);

    // Preparar información básica del juego
    const gameInfo: Omit<CreateGame, 'game_type' | 'hangman'> = {
      Name: hangmanData.name.trim(),
      Description: hangmanData.description.trim(),
      ProfessorId: hangmanData.professorId,
      Activated: false,
      Difficulty: hangmanData.difficulty as Difficulty,
      Visibility: hangmanData.visibility as Visibility,
      settings: [
        { ConfigKey: 'TiempoLimite', ConfigValue: configData.timeLimit.toString() },
        { ConfigKey: 'Tema', ConfigValue: configData.theme },
        { ConfigKey: 'Fuente', ConfigValue: configData.font },
        { ConfigKey: 'ColorFondo', ConfigValue: configData.backgroundColor },
        { ConfigKey: 'ColorTexto', ConfigValue: configData.fontColor },
        { ConfigKey: 'MensajeExito', ConfigValue: configData.successMessage },
        { ConfigKey: 'MensajeFallo', ConfigValue: configData.failureMessage },
        { ConfigKey: 'JuegoPublico', ConfigValue: configData.publicGame.toString() }
      ],
      assessment: {
        value: configData.assessmentValue,
        comments: configData.assessmentComments.trim()
      }
    };

    // Tomamos solo la primera palabra
    const firstWord = this.wordsArray.controls[0]?.value;

    const hangmanDataToSend: HangmanData = {
      word: firstWord.word.trim(),
      clue: this.showClues ? firstWord.clue.trim() : '',
      presentation: hangmanData.presentation
    };

    return {
      gameInfo,
      hangmanData: hangmanDataToSend,
      allWords: words
    };
  }

  // Métodos de mensajes
  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 5000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 8000);
  }

  onSubmit(): void {
    this.markAllAsTouched();

    if (!this.isFormValid()) {
      this.showError('Por favor completa todos los campos requeridos correctamente.');
      return;
    }

    const firstWord = this.wordsArray.controls[0]?.value;

    if (!firstWord || !firstWord.word || firstWord.word.trim().length < 2) {
      this.showError('La palabra es requerida y debe tener al menos 2 caracteres.');
      return;
    }

    if (this.showClues && (!firstWord.clue || firstWord.clue.trim().length < 5)) {
      this.showError('La pista es requerida y debe tener al menos 5 caracteres.');
      return;
    }

    this.isLoading = true;

    try {
      const hangmanData = this.hangmanForm.value;
      const configData = this.configForm.value;

      const gameInfo: Omit<CreateGame, 'game_type' | 'hangman'> = {
        Name: hangmanData.name.trim(),
        Description: hangmanData.description.trim(),
        ProfessorId: parseInt(hangmanData.professorId, 10),
        Activated: false,
        Difficulty: hangmanData.difficulty as Difficulty,
        Visibility: hangmanData.visibility as Visibility,
        settings: [
          { ConfigKey: 'TiempoLimite', ConfigValue: configData.timeLimit.toString() },
          { ConfigKey: 'Tema', ConfigValue: configData.theme },
          { ConfigKey: 'Fuente', ConfigValue: configData.font },
          { ConfigKey: 'ColorFondo', ConfigValue: configData.backgroundColor },
          { ConfigKey: 'ColorTexto', ConfigValue: configData.fontColor },
          { ConfigKey: 'MensajeExito', ConfigValue: configData.successMessage },
          { ConfigKey: 'MensajeFallo', ConfigValue: configData.failureMessage },
          { ConfigKey: 'JuegoPublico', ConfigValue: configData.publicGame.toString() }
        ],
        assessment: {
          value: configData.assessmentValue,
          comments: configData.assessmentComments.trim()
        }
      };

      // Tomamos solo la primera palabra
      const firstWord = this.wordsArray.controls[0]?.value;

      const hangmanDataToSend: HangmanData = {
        word: firstWord.word.trim(),
        clue: this.showClues ? firstWord.clue.trim() : '',
        presentation: hangmanData.presentation
      };
      this.gameService.createHangmanGame(gameInfo, hangmanDataToSend).subscribe({
        next: (gameInstance) => {
          console.log('✅ Juego creado:', gameInstance);
          Swal.fire({
            title: "Nuevo juego del ahorcado!",
            text: "La creacion del juego fue exitosa!",
            icon: "success"
          });
          this.showSuccess(`¡Juego creado exitosamente!`);
          setTimeout(() => this.router.navigate(['/juegos']), 2000);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error al crear el juego:', error);
          this.showError(error.message || 'Error inesperado al crear el juego. Por favor, inténtalo de nuevo.');
          this.isLoading = false;
          Swal.fire({
            title: "Ups!",
            text: "No se pudo crear el juego. Por favor, inténtalo de nuevo.",
            icon: "error"
          });
        }
      });
    } catch (error) {
      console.error('🚨 Error al preparar datos:', error);
      this.showError('Error al preparar los datos del juego. Verifica la información ingresada.');
      this.isLoading = false;
    }
  }

  // Método para cancelar
  onCancel(): void {
    if (confirm('¿Estás seguro de que deseas cancelar? Se perderán todos los datos ingresados.')) {
      this.router.navigate(['/juegos']);
    }
  }

  get assessmentComments() {
    return this.configForm.get('assessmentComments');
  }

  // Método para resetear formularios (opcional)
  resetForms(): void {
    this.hangmanForm.reset();
    this.configForm.reset();

    // Limpiar array de palabras
    while (this.wordsArray.length) {
      this.wordsArray.removeAt(0);
    }

    // Agregar una palabra inicial
    this.addNewWord();

    this.activeTab = 'content';
    this.showClues = true;
  }
}
