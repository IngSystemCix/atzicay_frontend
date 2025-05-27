// configuration-hangman.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {HangmanStateService} from '../../../../core/infrastructure/api/createGame/hangman-state.service';
import {GameService} from '../../../../core/infrastructure/api/createGame/game.service';

@Component({
  selector: 'app-configuration-hangman',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './configuration-hangman.component.html',
  styleUrls: ['./configuration-hangman.component.css']
})
export class ConfigurationHangmanComponent {
  configForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  // Opciones para los selectores
  themes = ['Claro', 'Oscuro', 'Azul', 'Verde'];
  fonts = ['Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New'];
  difficulties = ['Fácil', 'Medio', 'Difícil'];

  constructor(
    private fb: FormBuilder,
    private hangmanStateService: HangmanStateService,
    private gameService: GameService,
    private router: Router
  ) {
    this.configForm = this.fb.group({
      timeLimit: [30, [Validators.min(10), Validators.max(300)]],
      theme: ['Claro', Validators.required],
      font: ['Arial', Validators.required],
      backgroundColor: ['#ffffff', Validators.required],
      fontColor: ['#000000', Validators.required],
      successMessage: ['¡Felicidades!', [Validators.required, Validators.minLength(3)]],
      failureMessage: ['Inténtalo de nuevo', [Validators.required, Validators.minLength(3)]],
      publicGame: [true]
    });
  }

  onSubmit(): void {
    if (this.isLoading || this.configForm.invalid) {
      this.showError('Por favor completa todos los campos requeridos.');
      return;
    }

    this.isLoading = true;

    // Recuperar datos previos del estado compartido
    const hangmanData = this.hangmanStateService.getHangmanData();
    if (!hangmanData) {
      this.showError('No hay datos previos del juego. Completa la información antes.');
      this.isLoading = false;
      return;
    }

    // Combinar datos de configuración con los del juego
    const completeGameData = {
      ...hangmanData,
      ...this.configForm.value
    };

    // Preparar payload final para el backend
    const payload = {
      Name: completeGameData.name,
      Description: completeGameData.description,
      ProfessorId: completeGameData.professorId,
      Activated: true,
      Difficulty: completeGameData.difficulty,
      Visibility: completeGameData.visibility,
      settings: [
        { ConfigKey: 'TiempoLimite', ConfigValue: completeGameData.timeLimit.toString() },
        { ConfigKey: 'Tema', ConfigValue: completeGameData.theme },
        { ConfigKey: 'Fuente', ConfigValue: completeGameData.font },
        { ConfigKey: 'ColorFondo', ConfigValue: completeGameData.backgroundColor },
        { ConfigKey: 'ColorTexto', ConfigValue: completeGameData.fontColor },
        { ConfigKey: 'MensajeExito', ConfigValue: completeGameData.successMessage },
        { ConfigKey: 'MensajeFallo', ConfigValue: completeGameData.failureMessage }
      ],
      assessment: {
        value: completeGameData.assessmentValue,
        comments: completeGameData.assessmentComments
      },
      game_type: 'hangman',
      hangman: {
        word: completeGameData.words[0]?.word || '',
        clue: completeGameData.words[0]?.clue || '',
        presentation: completeGameData.presentation
      }
    };

    // Validar antes de enviar
    const errors = this.gameService.validateGameData(payload as any);
    if (errors.length > 0) {
      this.showError(errors.join(', '));
      this.isLoading = false;
      return;
    }

    // Enviar al backend
    this.gameService.createHangmanGame(
      {
        Name: payload.Name,
        Description: payload.Description,
        ProfessorId: payload.ProfessorId,
        Activated: payload.Activated,
        Difficulty: payload.Difficulty,
        Visibility: payload.Visibility,
        settings: payload.settings,
        assessment: payload.assessment
      },
      payload.hangman!
    ).subscribe({
      next: () => {
        this.showSuccess('Juego creado exitosamente');
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/juegos']);
        }, 2000);
      },
      error: (err: any) => {
        this.showError(err.message || 'Error al crear el juego');
        this.isLoading = false;
      }
    });
  }

  onColorChange(field: string, color: string): void {
    this.configForm.get(field)?.setValue(color);
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

  get timeLimit() { return this.configForm.get('timeLimit'); }
  get theme() { return this.configForm.get('theme'); }
  get font() { return this.configForm.get('font'); }
  get backgroundColor() { return this.configForm.get('backgroundColor'); }
  get fontColor() { return this.configForm.get('fontColor'); }
  get successMessageControl() { return this.configForm.get('successMessage'); }
  get failureMessageControl() { return this.configForm.get('failureMessage'); }
}
