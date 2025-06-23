import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { AtzicayTabsComponent } from '../../../components/atzicay-tabs/atzicay-tabs.component';
import { AtzicayButtonComponent } from '../../../components/atzicay-button/atzicay-button.component';
import { CreateGameService } from '../../../../core/infrastructure/api/create-game.service';
import { UserSessionService } from '../../../../core/infrastructure/service/user-session.service';
import { CreateGame, HangmanWord } from '../../../../core/domain/model/create-game.model';
import { BaseCreateGameComponent } from '../../../../core/presentation/shared/my-games/base-create-game.component';

@Component({
  selector: 'app-layout-hangman',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AtzicayTabsComponent,
    AtzicayButtonComponent,
  ],
  templateUrl: './layout-hangman.component.html',
  styleUrls: ['./layout-hangman.component.css'],
})
export class LayoutHangmanComponent extends BaseCreateGameComponent implements OnInit {
  activeTab = 'content';
  tabs = [
    { id: 'content', label: 'Contenido' },
    { id: 'config', label: 'Configuración' },
    { id: 'preview', label: 'Vista Previa' },
  ];
  showClues = true;
  juegoPublico = true;
  hangmanForm!: FormGroup;
  wordsForm!: FormGroup;
  configForm!: FormGroup;
  successMessage = '';
  errorMessage = '';
  isLoading = false;
  fonts = ['Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New'];
  fuenteSeleccionada: string = this.fonts[0];

  constructor(
    private fb: FormBuilder,
    private createGameService: CreateGameService,
    private userSession: UserSessionService,
    private router: Router
  ) {
    super();
    this.initializeForms();
    const userId = this.userSession.getUserId();
    if (userId) this.userId = userId;
  }

  ngOnInit(): void {
    this.addNewWord();
  }

  private initializeForms(): void {
    this.hangmanForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      difficulty: ['E', Validators.required],
      visibility: ['P', Validators.required],
      presentation: ['A', Validators.required],
    });
    this.wordsForm = this.fb.group({
      words: this.fb.array([]),
    });
    this.configForm = this.fb.group({
      timeLimit: [60, [Validators.required, Validators.min(10), Validators.max(300)]],
      font: [this.fonts[0], Validators.required],
      backgroundColor: ['#ffffff', Validators.required],
      fontColor: ['#000000', Validators.required],
      successMessage: ['¡Excelente trabajo!', [Validators.required, Validators.minLength(3)]],
      failureMessage: ['Inténtalo de nuevo', [Validators.required, Validators.minLength(3)]],
    });
    this.fuenteSeleccionada = this.fonts[0];
  }

  get wordsArray(): FormArray {
    return this.wordsForm.get('words') as FormArray;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'config') {
      setTimeout(() => {
        this.configForm.updateValueAndValidity();
        this.fuenteSeleccionada = this.configForm.get('font')?.value || this.fonts[0];
      }, 0);
    }
  }

  addNewWord(): void {
    const wordForm = this.fb.group({
      word: ['', [Validators.required, Validators.minLength(2)]],
      clue: [{ value: '', disabled: !this.showClues }, this.showClues ? [Validators.required, Validators.minLength(5)] : []],
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
          clueControl.setValidators([Validators.required, Validators.minLength(5)]);
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

  private isFormValid(): boolean {
    return this.hangmanForm.valid && this.wordsForm.valid && this.wordsArray.length > 0 && this.configForm.valid;
  }

  private markAllAsTouched(): void {
    this.hangmanForm.markAllAsTouched();
    this.configForm.markAllAsTouched();
    this.wordsArray.controls.forEach((control) => {
      control.markAllAsTouched();
    });
  }

  private showSuccess(message: string): void {
    Swal.fire({ icon: 'success', title: '¡Éxito!', text: message, confirmButtonColor: '#A293FA', timer: 2500, timerProgressBar: true, showConfirmButton: false });
    this.successMessage = '';
    this.errorMessage = '';
  }

  private showError(message: string): void {
    Swal.fire({ icon: 'error', title: 'Error', text: message, confirmButtonColor: '#A293FA', timer: 3500, timerProgressBar: true, showConfirmButton: false });
    this.successMessage = '';
    this.errorMessage = '';
  }

  buildGameData(): CreateGame {
    const hangmanData = this.hangmanForm.value;
    const configData = this.configForm.value;
    const words: HangmanWord[] = this.wordsArray.controls.map((control) => ({
      Word: control.get('word')?.value?.trim(),
      Clue: this.showClues ? control.get('clue')?.value?.trim() : undefined,
      Presentation: hangmanData.presentation
    }));
    return {
      Name: hangmanData.name.trim(),
      Description: hangmanData.description.trim(),
      Activated: true,
      Difficulty: hangmanData.difficulty,
      Visibility: hangmanData.visibility,
      Settings: [
        { Key: 'TiempoLimite', Value: configData.timeLimit.toString() },
        { Key: 'Fuente', Value: configData.font },
        { Key: 'ColorFondo', Value: configData.backgroundColor },
        { Key: 'ColorTexto', Value: configData.fontColor },
        { Key: 'MensajeExito', Value: configData.successMessage },
        { Key: 'MensajeFallo', Value: configData.failureMessage },
      ],
      Words: words
    };
  }

  onSubmit(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.markAllAsTouched();
    if (!this.isFormValid()) {
      this.showError('Por favor completa todos los campos requeridos correctamente.');
      this.isLoading = false;
      return;
    }
    const gameData = this.buildGameData();
    const body = {
      gameType: 'hangman',
      data: gameData
    };
    this.createGameService.createHangmanGame(this.userId, body).subscribe(() => {
      this.isLoading = false;
      this.showSuccess('Juego creado exitosamente!');
      setTimeout(() => this.router.navigate(['/juegos']), 2000);
    }, (err) => {
      this.isLoading = false;
      this.showError('Error al crear el juego: ' + (err?.message || ''));
    });
  }

  onCancel(): void {
    if (confirm('¿Estás seguro de que deseas cancelar? Se perderán todos los datos ingresados.')) {
      this.router.navigate(['/juegos']);
    }
  }

  // Métodos de validación para el template
  get isNameInvalid(): boolean {
    const control = this.hangmanForm.get('name');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get isDescriptionInvalid(): boolean {
    const control = this.hangmanForm.get('description');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  isWordInvalid(index: number): boolean {
    const control = this.wordsArray.at(index)?.get('word');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  isClueInvalid(index: number): boolean {
    if (!this.showClues) return false;
    const control = this.wordsArray.at(index)?.get('clue');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Getters públicos para el template
  get successMessageControl() {
    return this.configForm.get('successMessage');
  }

  get failureMessageControl() {
    return this.configForm.get('failureMessage');
  }

  /**
   * Devuelve la palabra de vista previa para el índice dado (usado en el tab de preview)
   */
  getPreviewWord(index: number): string[] {
    if (this.wordsArray.length === 0) return [];
    const word = this.wordsArray.at(index)?.get('word')?.value || '';
    return word.split('');
  }

  /**
   * Devuelve la pista de vista previa para el índice dado (usado en el tab de preview)
   */
  getPreviewClue(index: number): string {
    if (!this.showClues || this.wordsArray.length === 0) return '';
    return this.wordsArray.at(index)?.get('clue')?.value || '';
  }
}
