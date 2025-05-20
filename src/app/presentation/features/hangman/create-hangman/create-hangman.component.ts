import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { HangmanService } from '../../../../core/infrastructure/api/Hangman/hangman.service';
import { Hangman } from '../../../../core/domain/model/hangman/hangman';
import { RouterLink } from '@angular/router';

interface WordClue {
  word: string;
  clue: string;
}

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
  activeTab: 'content' | 'config' | 'preview' = 'content';
  showClues: boolean = true;
  hangmanForm: FormGroup;
  wordsForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  words: WordClue[] = [];
  router: string = '';

  constructor(private fb: FormBuilder, private hangmanService: HangmanService) {
    this.hangmanForm = this.fb.group({
      GameInstanceId: ['', Validators.required],
      Presentation: ['', Validators.required]
    });

    this.wordsForm = this.fb.group({
      words: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Add initial two words
    this.addNewWord();
    this.addNewWord();
  }

  get wordsArray(): FormArray {
    return this.wordsForm.get('words') as FormArray;
  }

  addNewWord(): void {
    const wordForm = this.fb.group({
      Word: ['', [Validators.required, Validators.minLength(3)]],
      Clue: ['', Validators.required]
    });

    this.wordsArray.push(wordForm);
  }

  removeWord(index: number): void {
    if (this.wordsArray.length > 1) {
      this.wordsArray.removeAt(index);
    } else {
      this.errorMessage = 'Se requiere al menos una palabra para el juego.';
      setTimeout(() => this.errorMessage = '', 3000);
    }
  }

  toggleShowClues(): void {
    this.showClues = !this.showClues;
  }

  onSubmit(): void {
    if (this.hangmanForm.valid && this.wordsForm.valid) {
      const words = this.wordsArray.controls.map(control => ({
        Word: control.get('Word')?.value,
        Clue: control.get('Clue')?.value
      }));

      if (words.length === 0) {
        this.errorMessage = 'Debes agregar al menos una palabra.';
        return;
      }

      // Preparar los datos para enviar al servicio
      const baseData = {
        GameInstanceId: this.hangmanForm.value.GameInstanceId,
        Presentation: this.hangmanForm.value.Presentation
      };

      // Enviar la primera palabra como ejemplo (ajusta según tus necesidades)
      const hangmanData: Hangman = new Hangman({
        ...baseData,
        Word: words[0].Word,
        Clue: words[0].Clue
      });

      this.hangmanService.createHangman(hangmanData).subscribe({
        next: (response) => {
          this.successMessage = 'Juego de Hangman creado exitosamente.';
          this.hangmanForm.reset();
          this.resetWordsForm();
          // Limpiar el mensaje después de 3 segundos
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Ocurrió un error al crear el juego.';
          console.error(error);
          // Limpiar el mensaje después de 3 segundos
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    } else {
      this.markAllAsTouched();
      this.errorMessage = 'Por favor completa todos los campos requeridos.';
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => this.errorMessage = '', 3000);
    }
  }

  private resetWordsForm(): void {
    while (this.wordsArray.length) {
      this.wordsArray.removeAt(0);
    }
    this.addNewWord();
    this.addNewWord();
  }

  private markAllAsTouched(): void {
    this.hangmanForm.markAllAsTouched();
    this.wordsArray.controls.forEach(control => {
      control.markAllAsTouched();
    });
  }
}
