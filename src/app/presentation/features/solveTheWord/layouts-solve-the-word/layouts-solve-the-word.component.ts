import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AtzicayTabsComponent } from '../../../components/atzicay-tabs/atzicay-tabs.component';
import { AtzicayButtonComponent } from '../../../components/atzicay-button/atzicay-button.component';
import { CreateGameService } from '../../../../core/infrastructure/api/create-game.service';
import { UserSessionService } from '../../../../core/infrastructure/service/user-session.service';
import { BaseCreateGameComponent } from '../../../../core/presentation/shared/my-games/base-create-game.component';
import { CreateGame } from '../../../../core/domain/model/create-game.model';

// Enum para orientación compatible con backend
export enum SolveTheWordOrientation {
  HL = 'HL', // Horizontal Left
  HR = 'HR', // Horizontal Right
  VU = 'VU', // Vertical Up
  VD = 'VD', // Vertical Down
  DU = 'DU', // Diagonal Up
  DD = 'DD', // Diagonal Down
}

@Component({
  selector: 'app-layouts-solve-the-word',
  standalone: true,
  imports: [CommonModule, FormsModule, AtzicayTabsComponent, AtzicayButtonComponent],
  templateUrl: './layouts-solve-the-word.component.html',
  styleUrl: './layouts-solve-the-word.component.css'
})
export class LayoutsSolveTheWordComponent extends BaseCreateGameComponent implements OnInit {
  activeTab = 'contenido';
  tabs = [
    { id: 'contenido', label: 'Contenido' },
    { id: 'configuracion', label: 'Configuración' },
    { id: 'vista-previa', label: 'Vista Previa' }
  ];
  // Datos del juego
  gameTitle = '';
  gameDescription = '';
  gridSize = '10 x 10';
  words: Array<{ id: number; word: string; orientation: string }> = [
    { id: 1, word: '', orientation: 'HL' }
  ];
  fontFamily = 'Arial';
  backgroundColor = '#FFFFFF';
  fontColor = '#000000';
  successMessage = '¡Felicidades, ganaste!';
  failureMessage = 'Intenta de nuevo';
  isPublicGame = true;
  difficulty = 'M';
  colorOptions = [
    { name: 'gray', class: 'bg-gray-300' },
    { name: 'cyan', class: 'bg-cyan-300' },
    { name: 'purple', class: 'bg-purple-300' },
    { name: 'rainbow', class: 'bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400' }
  ];
  isLoading = false;
  rows: number = 10;
  cols: number = 10;

  constructor(
    private createGameService: CreateGameService,
    private userSession: UserSessionService,
    private router: Router
  ) {
    super();
    const userId = this.userSession.getUserId();
    if (userId) this.userId = userId;
  }

  ngOnInit(): void {}

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  addWord() {
    const newId = this.words.length + 1;
    this.words.push({ id: newId, word: '', orientation: 'HL' });
  }

  removeWord(id: number) {
    if (this.words.length > 1) {
      this.words = this.words.filter(word => word.id !== id);
    }
  }

  selectColor(colorName: string, type: 'background' | 'font') {
    if (type === 'background') {
      this.backgroundColor = colorName;
    } else {
      this.fontColor = colorName;
    }
  }

  cancel() {
    this.router.navigate(['/juegos']);
  }

  save() {
    if (this.isLoading) return;
    this.isLoading = true;
    if (!this.validateForm()) {
      this.isLoading = false;
      return;
    }
    const gameData = this.buildGameData();
    const body = { data: gameData };
    console.log('JSON enviado al backend:', JSON.stringify(body, null, 2));
    this.createGameService.createSolveTheWordGame(this.userId, body).subscribe({
      next: () => {
        this.isLoading = false;
        alert('¡Juego creado exitosamente!');
        this.router.navigate(['/juegos']);
      },
      error: (err) => {
        this.isLoading = false;
        alert('Error al crear el juego: ' + (err?.message || ''));
      }
    });
  }

  buildGameData(): CreateGame {
    // Usar los valores numéricos de rows y cols
    const solveWords = this.words
      .filter(w => w.word.trim().length > 0)
      .map(w => ({
        Word: w.word.toUpperCase().trim(),
        Orientation: w.orientation // Debe ser HR, VD, etc. según backend
      }));
    return {
      Name: this.gameTitle.trim(),
      Description: this.gameDescription.trim(),
      Activated: true,
      Difficulty: this.difficulty,
      Visibility: this.isPublicGame ? 'P' : 'R',
      Rows: this.rows,
      Cols: this.cols,
      Words: solveWords,
      Settings: [
        { Key: 'Fuente', Value: this.fontFamily || 'Arial' },
        { Key: 'ColorFondo', Value: this.backgroundColor },
        { Key: 'ColorTexto', Value: this.fontColor },
        { Key: 'MensajeExito', Value: this.successMessage || '¡Excelente trabajo!' },
        { Key: 'MensajeFallo', Value: this.failureMessage || '¡Inténtalo de nuevo!' }
      ]
    };
  }

  validateForm(): boolean {
    if (!this.gameTitle.trim()) {
      alert('El título del juego es requerido');
      return false;
    }
    if (!this.gameDescription.trim()) {
      alert('La descripción del juego es requerida');
      return false;
    }
    const validWords = this.words.filter(w => w.word.trim().length > 0);
    if (validWords.length === 0) {
      alert('Debe agregar al menos una palabra');
      return false;
    }
    const invalidWords = validWords.filter(w => w.word.trim().length < 2);
    if (invalidWords.length > 0) {
      alert('Todas las palabras deben tener al menos 2 caracteres');
      return false;
    }
    return true;
  }
}