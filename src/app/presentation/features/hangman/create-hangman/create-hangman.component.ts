// create-hangman.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {CreateGame} from '../../../../core/domain/interface/create-game';
import {GameType} from '../../../../core/domain/enum/game-type';
import {HangmanData} from '../../../../core/domain/interface/hangman-data';
import {GameService} from '../../../../core/infrastructure/api/createGame/game.service';
import {HangmanStateService} from '../../../../core/infrastructure/api/createGame/hangman-state.service';
import {HangmanFormData} from '../../../../core/domain/interface/hangman-form';

@Component({
  selector: 'app-create-hangman',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './create-hangman.component.html',
  styleUrl: './create-hangman.component.css'
})
export class CreateHangmanComponent implements OnInit {
  showClues: boolean = true;
  hangmanForm!: FormGroup;
  wordsForm!: FormGroup;
  configForm!: FormGroup;

  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private gameService: GameService,
    private hangmanStateServie: HangmanStateService,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    // Agregar dos palabras iniciales
    this.addNewWord();
    this.addNewWord();
  }

  private initializeForms(): void {
    // Formulario principal del juego
    this.hangmanForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      professorId: [1, [Validators.required, Validators.min(1)]],
      difficulty: ['M', Validators.required],
      visibility: ['P', Validators.required],
      presentation: ['A', Validators.required]
    });

    // Formulario de palabras
    this.wordsForm = this.fb.group({
      words: this.fb.array([])
    });

    // Formulario de configuración
    this.configForm = this.fb.group({
      timeLimit: [30, [Validators.min(10), Validators.max(300)]],
      theme: ['Claro'],
      font: ['Arial'],
      backgroundColor: ['#ffffff'],
      fontColor: ['#000000'],
      successMessage: ['¡Felicidades!', [Validators.required]],
      failureMessage: ['Inténtalo de nuevo', [Validators.required]],
      assessmentValue: [0.8],
      assessmentComments: ['Juego de hangman creado exitosamente']
    });
  }

  get wordsArray(): FormArray {
    return this.wordsForm.get('words') as FormArray;
  }

  addNewWord(): void {
    const wordForm = this.fb.group({
      word: ['', [Validators.required, Validators.minLength(2)]],
      clue: ['', this.showClues ? [Validators.required, Validators.minLength(5)] : []]
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

    // Actualizar validadores según si se muestran pistas o no
    this.wordsArray.controls.forEach(control => {
      const clueControl = control.get('clue');
      if (clueControl) {
        if (this.showClues) {
          clueControl.setValidators([Validators.required, Validators.minLength(5)]);
        } else {
          clueControl.clearValidators();
          clueControl.setValue('');
        }
        clueControl.updateValueAndValidity();
      }
    });
  }


  private isFormValid(): boolean {
    return this.hangmanForm.valid &&
      this.wordsForm.valid &&
      this.wordsArray.length > 0;
  }

  private prepareFormData(): HangmanFormData {
    const hangmanData = this.hangmanForm.value;

    const words = this.wordsArray.controls.map(control => ({
      word: control.get('word')?.value || '',
      clue: control.get('clue')?.value || ''
    })).filter(w => w.word.length > 0);

    return {
      name: hangmanData.name,
      description: hangmanData.description,
      professorId: hangmanData.professorId,
      difficulty: hangmanData.difficulty,
      visibility: hangmanData.visibility,
      presentation: hangmanData.presentation,
      showClues: this.showClues,
      words: words,
      timeLimit: this.configForm.get('timeLimit')?.value || 30,
      theme: this.configForm.get('theme')?.value || 'Claro',
      font: this.configForm.get('font')?.value || 'Arial',
      backgroundColor: this.configForm.get('backgroundColor')?.value || '#ffffff',
      fontColor: this.configForm.get('fontColor')?.value || '#000000',
      successMessage: this.configForm.get('successMessage')?.value || '¡Felicidades!',
      failureMessage: this.configForm.get('failureMessage')?.value || 'Inténtalo de nuevo',
      assessmentValue: this.configForm.get('assessmentValue')?.value || 0.8,
      assessmentComments: this.configForm.get('assessmentComments')?.value || 'Juego de hangman creado exitosamente'
    };
  }

  private resetForms(): void {
    this.hangmanForm.reset({
      professorId: 1,
      difficulty: 'M',
      visibility: 'P',
      presentation: 'A'
    });

    // Limpiar array de palabras
    while (this.wordsArray.length) {
      this.wordsArray.removeAt(0);
    }

    // Agregar palabras iniciales
    this.addNewWord();
    this.addNewWord();

    this.configForm.reset({
      timeLimit: 30,
      theme: 'Claro',
      font: 'Arial',
      backgroundColor: '#ffffff',
      fontColor: '#000000',
      successMessage: '¡Felicidades! Has completado el juego.',
      failureMessage: '¡Inténtalo de nuevo!',
      assessmentValue: 0.8,
      assessmentComments: 'Juego de hangman creado exitosamente'
    });
  }

  private markAllAsTouched(): void {
    this.hangmanForm.markAllAsTouched();
    this.wordsArray.controls.forEach(control => {
      control.markAllAsTouched();
    });
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 5000);
  }

  private   showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 5000);
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

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.markAllAsTouched();
      this.showError('Por favor completa todos los campos requeridos.');
      return;
    }

    this.isLoading = true;

    const { hangmanData, gameInfo } = this.prepareFormDataToSend();

    // Validar antes de enviar (opcional pero recomendado)
    const errors = this.gameService.validateGameData({
      ...gameInfo,
      game_type: GameType.HANGMAN,
      hangman: hangmanData
    });

    if (errors.length > 0) {
      this.showError(errors.join(', '));
      this.isLoading = false;
      return;
    }

    // Enviar al backend
    this.gameService.createHangmanGame(gameInfo, hangmanData).subscribe({
      next: (gameInstance) => {
        this.showSuccess('Juego creado exitosamente');
        this.resetForms();
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/juegos']);
        }, 2000);
      },
      error: (err) => {
        this.showError(err.message || 'Error al crear el juego');
        this.isLoading = false;
      }
    });
  }

  // Navega a configuración con datos
  onNextStep(): void {
    if (!this.isFormValid()) {
      this.markAllAsTouched();
      this.showError('Por favor completa todos los campos requeridos.');
      return;
    }

    const formData = this.prepareFormData();

    this.hangmanStateServie.setHangmanData(formData);
    this.router.navigate(['/juegos/hangman/config']);
  }
  onGoBack(): void {
    // Actualiza los datos actuales en el estado compartido antes de volver
    const currentData = this.hangmanStateServie.getHangmanData();
    if (currentData) {
      const updatedData = {
        ...currentData,
        ...this.configForm.value
      };
      this.hangmanStateServie.setHangmanData(updatedData);
    }

    this.router.navigate(['/juegos/hangman/content']); // Vuelve a contenido
  }

  private prepareFormDataToSend() {
    const hangmanData = this.hangmanForm.value;
    const configData = this.configForm.value;

    const words = this.wordsArray.controls.map(control => ({
      word: control.get('word')?.value?.trim() || '',
      clue: control.get('clue')?.value?.trim() || ''
    })).filter(w => w.word.length > 0);

    const firstWord = words[0]?.word || '';
    const firstClue = words[0]?.clue || '';

    const gameInfo: Omit<CreateGame, 'game_type' | 'hangman'> = {
      Name: hangmanData.name,
      Description: hangmanData.description,
      ProfessorId: hangmanData.professorId,
      Activated: true,
      Difficulty: hangmanData.difficulty,
      Visibility: hangmanData.visibility,
      settings: [
        { ConfigKey: 'TiempoLimite', ConfigValue: configData.timeLimit.toString() },
        { ConfigKey: 'Tema', ConfigValue: configData.theme },
        { ConfigKey: 'Fuente', ConfigValue: configData.font },
        { ConfigKey: 'ColorFondo', ConfigValue: configData.backgroundColor },
        { ConfigKey: 'ColorTexto', ConfigValue: configData.fontColor },
        { ConfigKey: 'MensajeExito', ConfigValue: configData.successMessage },
        { ConfigKey: 'MensajeFallo', ConfigValue: configData.failureMessage }
      ],
      assessment: {
        value: configData.assessmentValue,
        comments: configData.assessmentComments
      }
    };

    const hangmanDataToSend: HangmanData = {
      word: firstWord,
      clue: firstClue,
      presentation: hangmanData.presentation
    };

    return {
      gameInfo,
      hangmanData: hangmanDataToSend
    };
  }
}
