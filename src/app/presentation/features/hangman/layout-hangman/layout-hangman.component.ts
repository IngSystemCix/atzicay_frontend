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
import { FormsModule } from '@angular/forms';
import { AtzicayTabsComponent } from '../../../components/atzicay-tabs/atzicay-tabs.component';
import { AtzicayButtonComponent } from '../../../components/atzicay-button/atzicay-button.component';
import { GenericConfigGameComponent } from '../../../shared/components/generic-config-game/generic-config-game.component';
import { CreateGameService } from '../../../../core/infrastructure/api/create-game.service';
import { UserSessionService } from '../../../../core/infrastructure/service/user-session.service';
import { AlertService } from '../../../../core/infrastructure/service/alert.service';
import { CreateGame, HangmanWord } from '../../../../core/domain/model/create-game.model';
import { BaseCreateGameComponent } from '../../../../core/presentation/shared/my-games/base-create-game.component';
import { Platform } from '@angular/cdk/platform';
import { Visibility } from '../../../../core/domain/enum/visibility';

@Component({
  selector: 'app-layout-hangman',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AtzicayTabsComponent,
    AtzicayButtonComponent,
    GenericConfigGameComponent,
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
  isLoading = false;
  fonts = ['Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New'];
  fuenteSeleccionada: string = this.fonts[0];
  isMobile = false;
  constructor(
    private fb: FormBuilder,
    private createGameService: CreateGameService,
    private userSession: UserSessionService,
    private router: Router,
    private alertService: AlertService,
    private platform: Platform
  ) {
    super();
    this.initializeForms();
    const userId = this.userSession.getUserId();
    if (userId) this.userId = userId;
    this.isMobile = window.innerWidth < 768;
    window.addEventListener('resize', () => {
    this.isMobile = window.innerWidth < 768;
  });
  }

  getPreviewWordDisplay(index: number): string[] {
  const word = this.getPreviewWord(index);
  if (this.isMobile && word.length > 10) {
    return word.slice(0, 10).concat(['...']);
  }
  return word;
}

  ngOnInit(): void {
    // Solo agregar una palabra inicial si no hay palabras existentes
    if (this.wordsArray.length === 0) {
      this.addNewWord();
    }
  }

  private initializeForms(): void {
    this.hangmanForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      difficulty: ['E', Validators.required],
      Visibility: ['P', Validators.required],
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
      difficulty: ['E', Validators.required],
      visibility: ['P', Validators.required],
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

  isFormValid(): boolean {
    const hasMinWords = this.wordsArray.length >= 2;
    return this.hangmanForm.valid && this.wordsForm.valid && hasMinWords && this.configForm.valid;
  }

  private markAllAsTouched(): void {
    this.hangmanForm.markAllAsTouched();
    this.configForm.markAllAsTouched();
    this.wordsArray.controls.forEach((control) => {
      control.markAllAsTouched();
    });
  }

  private showSuccess(message: string): void {
    this.alertService.showSuccess(message);
  }

  private showError(message: string): void {
    this.alertService.showError(message);
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
      Difficulty: configData.difficulty,
      Visibility: configData.Visibility,
      Settings: [
        { ConfigKey: 'time_limit', ConfigValue: configData.timeLimit?.toString() },
        { ConfigKey: 'font', ConfigValue: configData.font },
        { ConfigKey: 'backgroundColor', ConfigValue: configData.backgroundColor },
        { ConfigKey: 'fontColor', ConfigValue: configData.fontColor },
        { ConfigKey: 'successMessage', ConfigValue: configData.successMessage },
        { ConfigKey: 'failureMessage', ConfigValue: configData.failureMessage },
      ],
      Words: words
    };
  }

  onSubmit(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.markAllAsTouched();
    
    if (!this.isFormValid()) {
      let errorMessage = 'Por favor completa todos los campos requeridos correctamente.';
      
      if (!this.hasMinimumWords) {
        errorMessage = 'Se requieren al menos 2 palabras para crear el juego.';
      } else if (this.hangmanForm.invalid) {
        errorMessage = 'Por favor completa correctamente la información del juego.';
      } else if (this.wordsForm.invalid) {
        errorMessage = 'Por favor revisa las palabras y pistas ingresadas.';
      } else if (this.configForm.invalid) {
        errorMessage = 'Por favor revisa la configuración del juego.';
      }
      
      this.showError(errorMessage);
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
      this.alertService.showGameCreatedSuccess('Juego del ahorcado');
      setTimeout(() => this.router.navigate(['/juegos']), 2000);
    }, (err) => {
      this.isLoading = false;
      this.alertService.showGameCreationError(err, 'juego del ahorcado');
    });
  }

  async onCancel(): Promise<void> {
    const shouldCancel = await this.alertService.showCancelGameCreation('Ahorcado');
    if (shouldCancel) {
      this.alertService.showCancellationSuccess('Ahorcado');
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

  get hasMinimumWords(): boolean {
    return this.wordsArray.length >= 2;
  }

  get wordsFormHasErrors(): boolean {
    return this.wordsForm.invalid || !this.hasMinimumWords;
  }

  getWordErrorMessage(index: number): string {
    const control = this.wordsArray.at(index)?.get('word');
    if (control?.hasError('required')) {
      return 'La palabra es requerida';
    }
    if (control?.hasError('minlength')) {
      return 'La palabra debe tener al menos 2 caracteres';
    }
    return '';
  }

  getClueErrorMessage(index: number): string {
    if (!this.showClues) return '';
    const control = this.wordsArray.at(index)?.get('clue');
    if (control?.hasError('required')) {
      return 'La pista es requerida cuando está habilitada';
    }
    if (control?.hasError('minlength')) {
      return 'La pista debe tener al menos 5 caracteres';
    }
    return '';
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

  /**
   * Maneja los cambios de configuración desde el componente genérico
   */
  onSettingsChange(settings: any): void {
    this.configForm.patchValue(settings);
    if (settings.font) {
      this.fuenteSeleccionada = settings.font;
    }
  }
}
