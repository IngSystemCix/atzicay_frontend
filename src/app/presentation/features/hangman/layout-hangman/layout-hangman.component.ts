import { Component } from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import { GameService } from '../../../../core/infrastructure/api/createGame/game.service';
import { HangmanFormData } from '../../../../core/domain/interface/hangman-form';
import {HangmanStateService} from '../../../../core/infrastructure/api/createGame/hangman-state.service';
import {Difficulty} from '../../../../core/domain/enum/difficulty';
import {Visibility} from '../../../../core/domain/enum/visibility';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-layout-hangman',
  templateUrl: './layout-hangman.component.html',
  imports: [
    NgClass,
    RouterOutlet,
    RouterLink
  ],
  styleUrls: ['./layout-hangman.component.css']
})
export class LayoutHangmanComponent {
  isLoading = false;
  activeTab: 'content' | 'config' | 'preview' = 'content';

  constructor(
    private router: Router,
    private hangmanStateService: HangmanStateService,
    private gameService: GameService
  ) {
    this.router.events.subscribe(() => {
      const url = this.router.url;
      if (url.includes('/content')) this.activeTab = 'content';
      else if (url.includes('/config')) this.activeTab = 'config';
      else if (url.includes('/preview')) this.activeTab = 'preview';
    });
  }

  onSave(): void {
    const formData = this.hangmanStateService.getHangmanData();
    if (!formData) {
      alert('No hay datos para guardar');
      return;
    }

    const payload = {
      Name: formData.name ?? '',
      Description: formData.description ?? '',
      ProfessorId: formData.professorId ?? 1,
      Activated: true,
      Difficulty: Difficulty[formData.difficulty as keyof typeof Difficulty],
      Visibility: Visibility[formData.visibility as keyof typeof Visibility],
      settings: [
        { ConfigKey: 'TiempoLimite', ConfigValue: String(formData.timeLimit ?? 30) },
        { ConfigKey: 'Tema', ConfigValue: formData.theme ?? 'Claro' },
        { ConfigKey: 'Fuente', ConfigValue: formData.font ?? 'Arial' },
        { ConfigKey: 'ColorFondo', ConfigValue: formData.backgroundColor ?? '#ffffff' },
        { ConfigKey: 'ColorTexto', ConfigValue: formData.fontColor ?? '#000000' },
        { ConfigKey: 'MensajeExito', ConfigValue: formData.successMessage ?? '¡Felicidades!' },
        { ConfigKey: 'MensajeFallo', ConfigValue: formData.failureMessage ?? 'Inténtalo de nuevo' }
      ],
      assessment: {
        value: formData.assessmentValue ?? 0.8,
        comments: formData.assessmentComments ?? 'Juego creado exitosamente'
      },
      game_type: 'hangman',
      hangman: {
        word: formData.words.length > 0 ? formData.words[0].word : '',
        clue: formData.words.length > 0 ? formData.words[0].clue : '',
        presentation: formData.presentation ?? 'A'
      }
    };

    this.isLoading = true;
    this.gameService.createHangmanGame(payload, payload.hangman!).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Juego guardado exitosamente');
        this.router.navigate(['/juegos']);
      },
      error: (err) => {
        this.isLoading = false;
        alert('Error al guardar el juego: ' + err.message);
      }
    });
  }
}
