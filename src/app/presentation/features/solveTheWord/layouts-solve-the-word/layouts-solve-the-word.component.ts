import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AtzicayTabsComponent } from '../../../components/atzicay-tabs/atzicay-tabs.component';
import { AtzicayButtonComponent } from '../../../components/atzicay-button/atzicay-button.component';
import { GenericConfigGameComponent } from '../../../components/generic-config-game/generic-config-game.component';
import { CreateGameService } from '../../../../core/infrastructure/api/create-game.service';
import { UserSessionService } from '../../../../core/infrastructure/service/user-session.service';
import { AlertService } from '../../../../core/infrastructure/service/alert.service';
import { BaseCreateGameComponent } from '../../../../core/presentation/shared/my-games/base-create-game.component';
import { CreateGame } from '../../../../core/domain/model/create-game.model';
import { HostListener } from '@angular/core';


@Component({
  selector: 'app-layouts-solve-the-word',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AtzicayTabsComponent,
    AtzicayButtonComponent,
    GenericConfigGameComponent,
  ],
  templateUrl: './layouts-solve-the-word.component.html',
  styleUrl: './layouts-solve-the-word.component.css',
})
export class LayoutsSolveTheWordComponent
  extends BaseCreateGameComponent
  implements OnInit
{
  activeTab = 'contenido';
  tabs = [
    { id: 'contenido', label: 'Contenido' },
    { id: 'configuracion', label: 'Configuración' },
    { id: 'vista-previa', label: 'Vista Previa' },
  ];
  // Datos del juego
  gameTitle = '';
  gameDescription = '';
  gridSize = '10 x 10';
  words: Array<{ id: number; word: string; orientation: string }> = [
    { id: 1, word: '', orientation: 'HR' },
  ];
  fontFamily = 'Arial';
  backgroundColor = '#FFFFFF';
  fontColor = '#000000';
  successMessage = '¡Felicidades, ganaste!';
  failureMessage = 'Intenta de nuevo';
  isPublicGame = true;
  difficulty = 'M';
  timeLimit: number = 180;
  colorOptions = [
    { name: '#FFFFFF', class: 'bg-gray-300' },
    { name: '#E0F7FA', class: 'bg-cyan-300' },
    { name: '#F3E5F5', class: 'bg-purple-300' },
    {
      name: '#FFEBEE',
      class: 'bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400',
    },
  ];
  isLoading = false;
  rows: number = 10;
  cols: number = 10;
  isMobile = false;

  // Configuración para el componente genérico
  gameSettings = {
    font: 'Arial',
    fontColor: '#000000',
    backgroundColor: '#FFFFFF',
    successMessage: '¡Felicidades, ganaste!',
    failureMessage: 'Intenta de nuevo',
    difficulty: 'M',
    visibility: 'P',
    timeLimit: 180
  };
  setTimeLimit(value: number) {
    this.timeLimit = Math.max(30, Math.min(600, value));
    this.gameSettings.timeLimit = this.timeLimit;
  }

  constructor(
    private createGameService: CreateGameService,
    private userSession: UserSessionService,
    private router: Router,
    private alertService: AlertService
  ) {
    super();
    const userId = this.userSession.getUserId();
    if (userId) this.userId = userId;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.checkScreenSize();
  }
  private checkScreenSize() {
    this.isMobile = window.innerWidth < 640; 
  }
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  // Validaciones para filas y columnas
  setRows(value: number) {
    this.rows = Math.max(10, Math.min(30, value));
  }
  setCols(value: number) {
    this.cols = Math.max(10, Math.min(30, value));
  }

  // Calcular longitud máxima de palabra según orientación
  getMaxWordLength(orientation: string): number {
    if (orientation === 'HR' || orientation === 'HL') return this.cols;
    if (orientation === 'VD' || orientation === 'VU') return this.rows;
    // Diagonal: mínimo entre filas y columnas
    return Math.min(this.rows, this.cols);
  }

  addWord() {
    const newId = this.words.length + 1;
    this.words.push({ id: newId, word: '', orientation: 'HR' });
    setTimeout(() => {
      const input = document.querySelector(`#word-input-${newId}`) as HTMLInputElement;
      if (input) input.focus();
    }, 50);
  }

  removeWord(id: number) {
    if (this.words.length > 1) {
      this.words = this.words.filter((word) => word.id !== id);
    }
  }

  selectColor(colorName: string, type: 'background' | 'font') {
    if (type === 'background') {
      this.backgroundColor = colorName;
    } else {
      this.fontColor = colorName;
    }
  }

  async cancel(): Promise<void> {
    const shouldCancel = await this.alertService.showCancelGameCreation('Pupiletras');
    if (shouldCancel) {
      this.alertService.showCancellationSuccess('Pupiletras');
      this.router.navigate(['/juegos']);
    }
  }

  save() {
    if (this.isLoading) return;
    this.isLoading = true;
    if (!this.validateForm()) {
      this.isLoading = false;
      return;
    }
    const gameData = this.buildGameData();
    const body = {
      gameType: 'solve_the_word',
      data: gameData,
    };
    // Mostrar el JSON en consola
    this.createGameService.createSolveTheWordGame(this.userId, body).subscribe({
      next: () => {
        this.isLoading = false;
        this.alertService.showGameCreatedSuccess('Juego de encontrar palabras');
        setTimeout(() => this.router.navigate(['/juegos']), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.alertService.showGameCreationError(
          err,
          'juego de encontrar palabras'
        );
      },
    });
  }

  buildGameData(): CreateGame {
    // Usar los valores numéricos de rows y cols
    const solveWords = this.words
      .filter((w) => w.word.trim().length > 0)
      .map((w) => ({
        Word: w.word.toUpperCase().trim(),
        Orientation: w.orientation, // Debe ser HR, VD, etc. según backend
      }));
    return {
      Name: this.gameTitle.trim(),
      Description: this.gameDescription.trim(),
      Activated: true,
      Difficulty: this.gameSettings.difficulty,
      Visibility: this.gameSettings.visibility,
      Rows: this.rows,
      Cols: this.cols,
      Words: solveWords,
      Settings: [
        { ConfigKey: 'time_limit', ConfigValue: String(this.timeLimit) },
        { ConfigKey: 'font', ConfigValue: this.gameSettings.font || 'Arial' },
        { ConfigKey: 'backgroundColor', ConfigValue: this.gameSettings.backgroundColor },
        { ConfigKey: 'fontColor', ConfigValue: this.gameSettings.fontColor },
        {
          ConfigKey: 'successMessage',
          ConfigValue: this.gameSettings.successMessage || '¡Excelente trabajo!',
        },
        {
          ConfigKey: 'failureMessage',
          ConfigValue: this.gameSettings.failureMessage || '¡Inténtalo de nuevo!',
        },
      ],
    };
  }

  validateForm(): boolean {
    if (!this.gameTitle.trim()) {
      this.alertService.showError('El título del juego es requerido');
      return false;
    }
    if (!this.gameDescription.trim()) {
      this.alertService.showError('La descripción del juego es requerida');
      return false;
    }
    const validWords = this.words.filter((w) => w.word.trim().length > 0);
    if (validWords.length === 0) {
      this.alertService.showError('Debe agregar al menos una palabra');
      return false;
    }
    for (const w of validWords) {
      const maxLen = this.getMaxWordLength(w.orientation);
      if (w.word.trim().length < 2) {
        this.alertService.showError('Todas las palabras deben tener al menos 2 caracteres');
        return false;
      }
      if (w.word.trim().length > maxLen) {
        this.alertService.showError(`La palabra "${w.word}" excede el máximo permitido (${maxLen}) para la orientación seleccionada.`);
        return false;
      }
    }
    return true;
  }

  /**
   * Obtiene la configuración para el componente genérico
   */
  getConfigSettings() {
    return {
      font: this.gameSettings.font,
      fontColor: this.gameSettings.fontColor,
      backgroundColor: this.gameSettings.backgroundColor,
      successMessage: this.gameSettings.successMessage,
      failureMessage: this.gameSettings.failureMessage,
      difficulty: this.gameSettings.difficulty,
      visibility: this.gameSettings.visibility
    };
  }

  /**
   * Maneja los cambios del componente genérico de configuración
   */
  onConfigChange(settings: any) {
    // Actualizar gameSettings con los valores del componente genérico
    this.gameSettings = { ...this.gameSettings, ...settings };
    // Actualizar las propiedades individuales para mantener compatibilidad
    this.fontFamily = settings.font || this.fontFamily;
    this.fontColor = settings.fontColor || this.fontColor;
    this.backgroundColor = settings.backgroundColor || this.backgroundColor;
    this.successMessage = settings.successMessage || this.successMessage;
    this.failureMessage = settings.failureMessage || this.failureMessage;
    this.difficulty = settings.difficulty || this.difficulty;
    this.isPublicGame = settings.visibility === 'P';
    if (settings.timeLimit !== undefined) {
      this.timeLimit = settings.timeLimit;
    }
  }
}
