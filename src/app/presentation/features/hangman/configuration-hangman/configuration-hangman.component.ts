// configuration-hangman.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HangmanService } from '../../../../core/infrastructure/api/Hangman/hangman.service';
import { Router, RouterLink } from '@angular/router';
import {HangmanStateService} from '../../../../core/infrastructure/api/Hangman/hangman-state.service';

@Component({
  selector: 'app-configuration-hangman',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
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
    private hangmanService: HangmanService,
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
    if (this.isLoading) return;

    this.configForm.markAllAsTouched();

    if (this.configForm.invalid) {
      this.showError('Por favor completa todos los campos requeridos correctamente.');
      return;
    }

    this.isLoading = true;

    // Guardar configuración en el servicio compartido
    this.hangmanStateService.updateConfiguration(this.configForm.value);

    setTimeout(() => {
      this.showSuccess('Configuración guardada exitosamente');
      this.isLoading = false;

      // Redirigir al componente de creación
      this.router.navigate(['/juegos/hangman/crear']);
    }, 1500);
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
