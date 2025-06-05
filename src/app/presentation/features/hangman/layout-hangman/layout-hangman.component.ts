import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Difficulty } from '../../../../core/domain/enum/difficulty';
import { Visibility } from '../../../../core/domain/enum/visibility';
import { CreateGame } from '../../../../core/domain/interface/create-game';
import { HangmanData } from '../../../../core/domain/interface/hangman-data';
import { GameService } from '../../../../core/infrastructure/api/createGame/game.service';
import { UserService } from '../../../../core/infrastructure/api/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-layout-hangman',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './layout-hangman.component.html',
  styleUrls: ['./layout-hangman.component.css'],
})
export class LayoutHangmanComponent implements OnInit {
  // Control de tabs
  activeTab: 'content' | 'config' | 'preview' = 'content';

  // Control de pistas
  showClues: boolean = true;

  // Estado del juego
  juegoPublico: boolean = true;


  // Forms
  hangmanForm!: FormGroup;
  wordsForm!: FormGroup;
  configForm!: FormGroup;

  // Estados
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  // Opciones para configuración
  fonts = ['Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New'];
  fuenteSeleccionada: string = this.fonts[0];

  private currentProfessorId: number = 0;
  constructor(
    private fb: FormBuilder,
    private gameService: GameService,
    private router: Router,
    private usuarioService: UserService
  ) {
    this.initializeForms();
  }

  async ngOnInit(): Promise<void> {
    await this.loadUserData(); 
    this.addNewWord();
  }

  private async loadUserData(): Promise<void> {
    try {
      const userString = sessionStorage.getItem('user');
      if (!userString) throw new Error('No hay usuario en sesión');
      
      const user = JSON.parse(userString);
      const email = user?.Email;
      if (!email) throw new Error('El usuario no tiene email registrado');

      // Obtener el ID del usuario desde el servicio
      const userResponse = await this.usuarioService.findUserByEmail(email).toPromise();
      if (!userResponse?.data?.Id) throw new Error('ID de usuario no válido');
      
      this.currentProfessorId = userResponse.data.Id;
      console.log('ID del profesor obtenido:', this.currentProfessorId);
      
      // Actualizar el formulario con el ID correcto
      this.hangmanForm.patchValue({
        professorId: this.currentProfessorId
      });
      
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      this.currentProfessorId = 1; // Valor por defecto si falla
      this.hangmanForm.patchValue({
        professorId: this.currentProfessorId
      });
    }
  }

  private initializeForms(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const professorId = user?.Id || 1; 
    // Formulario principal del juego
    this.hangmanForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      professorId: [professorId, [Validators.required, Validators.min(1)]],
      difficulty: ['E', Validators.required],
      visibility: ['P', Validators.required],
      presentation: ['A', Validators.required],
    });

    // Formulario de palabras
    this.wordsForm = this.fb.group({
      words: this.fb.array([]),
    });

    // Formulario de configuración - sin valores por defecto
    this.configForm = this.fb.group({
      timeLimit: [
        60,
        [Validators.required, Validators.min(10), Validators.max(300)],
      ],
      theme: ['Claro', Validators.required],
      font: ['this.fonts[0]', Validators.required],
      backgroundColor: ['#ffffff', Validators.required],
      fontColor: ['#000000', Validators.required],
      successMessage: [
        '¡Excelente trabajo!',
        [Validators.required, Validators.minLength(3)],
      ],
      failureMessage: [
        'Inténtalo de nuevo',
        [Validators.required, Validators.minLength(3)],
      ],
      assessmentValue: [
        0.0,
        [Validators.required, Validators.min(0), Validators.max(1)],
      ],
      assessmentComments: [
        'Buen desafío para principiantes.',
        [Validators.required, Validators.minLength(5)],
      ],
      publicGame: [false],
    });
  }
  // Getters para formularios
  get wordsArray(): FormArray {
    return this.wordsForm.get('words') as FormArray;
  }

  get timeLimit() {
    return this.configForm.get('timeLimit');
  }
  get backgroundColor() {
    return this.configForm.get('backgroundColor');
  }
  get fontColor() {
    return this.configForm.get('fontColor');
  }
  get successMessageControl() {
    return this.configForm.get('successMessage');
  }
  get failureMessageControl() {
    return this.configForm.get('failureMessage');
  }

  // Métodos para tabs
  setActiveTab(tab: 'content' | 'config' | 'preview'): void {
    this.activeTab = tab;
  }

  // Métodos para palabras
  addNewWord(): void {
    const wordForm = this.fb.group({
      word: ['', [Validators.required, Validators.minLength(2)]],
      clue: [
        { value: '', disabled: !this.showClues }, 
        this.showClues ? [Validators.required, Validators.minLength(5)] : [],
      ],
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

    this.wordsArray.controls.forEach((control) => {
      const clueControl = control.get('clue');
      if (clueControl) {
        if (this.showClues) {
          clueControl.enable();
          clueControl.setValidators([
            Validators.required,
            Validators.minLength(5),
          ]);
        } else {
          clueControl.disable();
          clueControl.clearValidators();
          clueControl.setValue(''); 
        }
        clueControl.updateValueAndValidity();
      }
    });

    this.wordsForm.updateValueAndValidity();
  }

  onColorChange(field: string, color: string): void {
    this.configForm.get(field)?.setValue(color);
  }

  private isFormValid(): boolean {
    const isHangmanValid = this.hangmanForm.valid;
    const isWordsValid = this.wordsForm.valid && this.wordsArray.length > 0;
    const isConfigValid = this.configForm.valid;
    console.log('Validación de formularios:', {
      hangman: isHangmanValid,
      words: isWordsValid,
      config: isConfigValid,
      wordsCount: this.wordsArray.length,
    });
    return isHangmanValid && isWordsValid && isConfigValid;
  }

  private markAllAsTouched(): void {
    this.hangmanForm.markAllAsTouched();
    this.configForm.markAllAsTouched();
    this.wordsArray.controls.forEach((control) => {
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
    const words = this.wordsArray.controls
      .map((control) => ({
        word: control.get('word')?.value?.trim(),
        clue: control.get('clue')?.value?.trim(),
      }))
      .filter((w) => w.word && w.word.length >= 2);
    const userString = sessionStorage.getItem('user');
    const user = JSON.parse(userString || '{}');
    const email = user?.Email || '';
    // Preparar información básica del juego
    const gameInfo: Omit<CreateGame, 'game_type' | 'hangman'> = {
      Name: hangmanData.name.trim(),
      Description: hangmanData.description.trim(),
      ProfessorId: this.currentProfessorId,
      Activated: false,
      Difficulty: hangmanData.difficulty as Difficulty,
      Visibility: hangmanData.visibility as Visibility,
      settings: [
        {
          ConfigKey: 'TiempoLimite',
          ConfigValue: configData.timeLimit.toString(),
        },
        { ConfigKey: 'Fuente', ConfigValue: configData.font },
        { ConfigKey: 'ColorFondo', ConfigValue: configData.backgroundColor },
        { ConfigKey: 'ColorTexto', ConfigValue: configData.fontColor },
        { ConfigKey: 'MensajeExito', ConfigValue: configData.successMessage },
        { ConfigKey: 'MensajeFallo', ConfigValue: configData.failureMessage },
      ],
      assessment: {
        value: configData.assessmentValue,
        comments: configData.assessmentComments.trim(),
      },
    };

    const hangmanDataToSend: HangmanData = {
      presentation: hangmanData.presentation,
      words: this.wordsArray.controls.map((control) => ({
        word: control.get('word')?.value?.trim(),
        clue: control.get('clue')?.value?.trim(),
      })),
    };

    return {
      gameInfo,
      hangmanData: hangmanDataToSend,
      allWords: words,
    };
  }

  // Métodos de mensajes
  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 8000);
  }

  onSubmit(): void {
    if (this.isLoading) return;
    this.isLoading = true;

    this.markAllAsTouched();

    if (!this.isFormValid()) {
      this.showError(
        'Por favor completa todos los campos requeridos correctamente.'
      );
      this.isLoading = false;
      return;
    }

    const words: { word: string; clue?: string }[] =
      this.wordsArray.controls.map((control) => ({
        word: control.value.word?.trim(),
        clue: this.showClues ? control.value.clue?.trim() : '',
      }));

    const isInvalidWord = words.some((w) => !w.word || w.word.length < 2);
    const isInvalidClue =
      this.showClues && words.some((w) => !w.clue || w.clue.length < 5);

    if (isInvalidWord) {
      this.showError('Cada palabra debe tener al menos 2 caracteres.');
      return;
    }

    if (isInvalidClue) {
      this.showError('Cada pista debe tener al menos 5 caracteres.');
      return;
    }

    this.isLoading = true;

    try {
      const hangmanFormData = this.hangmanForm.value;
      const configData = this.configForm.value;

    const gameInfo: Omit<CreateGame, 'game_type' | 'hangman'> = {
      Name: hangmanFormData.name.trim(),
      Description: hangmanFormData.description.trim(),
      ProfessorId: this.currentProfessorId, 
      Activated: false,
      Difficulty: hangmanFormData.difficulty as Difficulty,
      Visibility: hangmanFormData.visibility as Visibility,
      settings: [
        {
          ConfigKey: 'TiempoLimite',
          ConfigValue: configData.timeLimit.toString(),
        },
        { ConfigKey: 'Fuente', ConfigValue: configData.font },
        { ConfigKey: 'ColorFondo', ConfigValue: configData.backgroundColor },
        { ConfigKey: 'ColorTexto', ConfigValue: configData.fontColor },
        { ConfigKey: 'MensajeExito', ConfigValue: configData.successMessage },
        { ConfigKey: 'MensajeFallo', ConfigValue: configData.failureMessage },
      ],
      assessment: {
        value: configData.assessmentValue,
        comments: configData.assessmentComments.trim(),
      },
    };

      // ✅ CORRECCIÓN: Crear SOLO los datos específicos de hangman
      const hangmanSpecificData: HangmanData = {
        presentation: hangmanFormData.presentation as 'A' | 'F',
        words: words.map((w) => ({
          word: w.word,
          clue: w.clue || '',
        })),
      };

      console.log('🎯 Datos del juego (sin hangman):', gameInfo);
      console.log('🎯 Datos específicos de hangman:', hangmanSpecificData);

      this.gameService
        .createHangmanGame(gameInfo, hangmanSpecificData)
        .subscribe({
          next: (gameInstance) => {
            console.log('✅ Juego creado:', gameInstance);
            this.isLoading = false;

            Swal.fire({
              title: '🎉 Nuevo juego del ahorcado!',
              text: 'La creación del juego fue exitosa.',
              icon: 'success',
            });

            this.showSuccess('✅ Juego creado exitosamente!');
            setTimeout(() => this.router.navigate(['/juegos']), 2000);
          },
          error: (error) => {
            console.error('❌ Error al crear el juego:', error);
            this.isLoading = false;

            this.showError(
              error.message ||
                'Error inesperado al crear el juego. Por favor, inténtalo de nuevo.'
            );

            Swal.fire({
              title: '❌ Ups!',
              text: 'No se pudo crear el juego. Por favor, inténtalo de nuevo.',
              icon: 'error',
            });
          },
        });
    } catch (error) {
      console.error('🚨 Error al preparar datos:', error);
      this.isLoading = false;
      this.showError(
        'Error al preparar los datos del juego. Verifica la información ingresada.'
      );
    }
  }

  // Método para cancelar
  onCancel(): void {
    if (
      confirm(
        '¿Estás seguro de que deseas cancelar? Se perderán todos los datos ingresados.'
      )
    ) {
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

  getPreviewWord(index: number): string {
    const wordControl = this.wordsArray.at(index);
    if (!wordControl) return '';
    
    const word = wordControl.get('word')?.value || '';
    return word.toUpperCase().replace(/\s+/g, ''); // Remover espacios y convertir a mayúsculas
  }
  
  /**
   * Obtiene una pista para mostrar en la vista previa
   */
  getPreviewClue(index: number): string {
    const wordControl = this.wordsArray.at(index);
    if (!wordControl) return '';
    
    return wordControl.get('clue')?.value || '';
  }
  
  /**
   * Valida si la vista previa puede mostrarse
   */
  canShowPreview(): boolean {
    return this.wordsArray.length > 0 && 
           this.hangmanForm.get('name')?.value?.trim() &&
           this.hangmanForm.get('description')?.value?.trim();
  }
}
