// create-hangman.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HangmanService } from '../../../../core/infrastructure/api/Hangman/hangman.service';
import { HangmanFormData } from '../../../../core/domain/interface/hangman-form';

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
    private hangmanService: HangmanService,
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
      professorId: [1, [Validators.required, Validators.min(1)]], // Valor por defecto, ajustar según tu lógica
      difficulty: ['M', Validators.required],
      visibility: ['P', Validators.required],
      presentation: ['A', Validators.required]
    });

    // Formulario de palabras
    this.wordsForm = this.fb.group({
      words: this.fb.array([])
    });

    // Formulario de configuración (opcional, para usar en el componente de configuración)
    this.configForm = this.fb.group({
      timeLimit: [30, [Validators.min(10), Validators.max(300)]],
      theme: ['Claro'],
      font: ['Arial'],
      backgroundColor: ['#ffffff'],
      fontColor: ['#000000'],
      successMessage: ['¡Felicidades! Has completado el juego.'],
      failureMessage: ['¡Inténtalo de nuevo!'],
      assessmentValue: [0.8, [Validators.min(0), Validators.max(5)]],
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
    const configData = this.configForm.value;
    const words = this.wordsArray.controls.map(control => ({
      word: control.get('word')?.value?.trim() || '',
      clue: control.get('clue')?.value?.trim() || ''
    })).filter(w => w.word.length > 0);

    return {
      name: hangmanData.name?.trim(),
      description: hangmanData.description?.trim(),
      professorId: hangmanData.professorId,
      difficulty: hangmanData.difficulty,
      visibility: hangmanData.visibility,
      presentation: hangmanData.presentation,
      showClues: this.showClues,
      words: words,

      // Configuraciones opcionales
      timeLimit: configData.timeLimit,
      theme: configData.theme,
      font: configData.font,
      backgroundColor: configData.backgroundColor,
      fontColor: configData.fontColor,
      successMessage: configData.successMessage,
      failureMessage: configData.failureMessage,
      assessmentValue: configData.assessmentValue,
      assessmentComments: configData.assessmentComments
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

  private showError(message: string): void {
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
}
