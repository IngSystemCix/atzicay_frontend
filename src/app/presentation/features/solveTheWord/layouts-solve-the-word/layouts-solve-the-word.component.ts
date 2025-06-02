import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Difficulty } from '../../../../core/domain/enum/difficulty';
import { GameService } from '../../../../core/infrastructure/api/createGame/game.service';
import { CreateGame } from '../../../../core/domain/interface/create-game';
import { Visibility } from '../../../../core/domain/enum/visibility';
import { SolveTheWordData } from '../../../../core/domain/interface/solve-the-word-data';
import { Orientation } from '../../../../core/domain/enum/orientacion';

@Component({
  selector: 'app-layouts-solve-the-word',
  imports: [CommonModule, FormsModule],
  templateUrl: './layouts-solve-the-word.component.html',
  styleUrl: './layouts-solve-the-word.component.css'
})
export class LayoutsSolveTheWordComponent {
  activeTab: string = 'contenido';

  // Contenido tab data
  gameTitle: string = '';
  gameDescription: string = '';
  gridSize: string = '10 x 10';

  // Palabras data - CORRECCIÓN: Cambiar orientación por valores correctos
  words: Array<{id: number, word: string, orientation: Orientation}> = [
    {id: 1, word: '', orientation: Orientation.HORIZONTAL_LEFT} 
  ];

  // Configuración data
  fontFamily: string = '';
  backgroundColor: string = 'gray';
  fontColor: string = 'gray';
  successMessage: string = '';
  failureMessage: string = '';
  isPublicGame: boolean = true;

  // Variables para dificultad - AGREGAR ESTAS
  difficulty: Difficulty = Difficulty.MEDIUM;
  professorId: number = 4; // Obtener del servicio de auth o context

  // Available colors
  colorOptions = [
    { name: 'gray', class: 'bg-gray-300' },
    { name: 'cyan', class: 'bg-cyan-300' },
    { name: 'purple', class: 'bg-purple-300' },
    { name: 'rainbow', class: 'bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400' }
  ];

  constructor(
    private gameService: GameService,
    private router: Router
  ) {}

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  addWord() {
    const newId = this.words.length + 1;
    this.words.push({id: newId, word: '', orientation: Orientation.HORIZONTAL_LEFT});
  }

  removeWord(id: number) {
    this.words = this.words.filter(word => word.id !== id);
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
    if (!this.validateForm()) {
      return;
    }

    const [rows, cols] = this.gridSize.split(' x ').map(size => parseInt(size.trim()));

    const gameInfo: Omit<CreateGame, 'game_type' | 'solve_the_word'> = {
      Name: this.gameTitle,
      Description: this.gameDescription,
      ProfessorId: this.professorId,
      Activated: true,
      Difficulty: this.difficulty,
      Visibility: this.isPublicGame ? Visibility.PUBLIC : Visibility.PRIVATE,
      settings: [
        { ConfigKey: 'font_family', ConfigValue: this.fontFamily || 'Arial' },
        { ConfigKey: 'background_color', ConfigValue: this.backgroundColor },
        { ConfigKey: 'font_color', ConfigValue: this.fontColor },
        { ConfigKey: 'success_message', ConfigValue: this.successMessage || '¡Excelente trabajo!' },
        { ConfigKey: 'failure_message', ConfigValue: this.failureMessage || '¡Inténtalo de nuevo!' }
      ],
      assessment: {
        value: 4.5,
        comments: 'Juego creado automáticamente'
      }
    };

    const solveWordData: SolveTheWordData = {
      rows: rows,
      columns: cols,
      words: this.words
        .filter(w => w.word.trim().length > 0)
        .map(w => ({
          word: w.word.toUpperCase().trim(),
          orientation: w.orientation
        }))
    };

    console.log('🎮 Enviando datos del juego:', { gameInfo, solveWordData });

    this.gameService.createSolveTheWordGame(gameInfo, solveWordData)
      .subscribe({
        next: (response) => {
          console.log('✅ Juego creado exitosamente:', response);
          alert('¡Juego creado exitosamente!');
          this.router.navigate(['/juegos']);
        },
        error: (error) => {
          console.error('❌ Error al crear el juego:', error);
          alert('Error al crear el juego: ' + error.message);
        }
      });
  }

  private validateForm(): boolean {
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

  debugGameData() {
    const [rows, cols] = this.gridSize.split(' x ').map(size => parseInt(size.trim()));
    
    const debugData = {
      Name: this.gameTitle,
      Description: this.gameDescription,
      ProfessorId: this.professorId,
      Activated: true,
      Difficulty: this.difficulty,
      Visibility: this.isPublicGame ? Visibility.PUBLIC : Visibility.PRIVATE,
      settings: [
        { ConfigKey: 'time_limit', ConfigValue: '30' },
        { ConfigKey: 'max_attempts', ConfigValue: '5' }
      ],
      assessment: {
        value: 4.5,
        comments: 'Buen juego para evaluación'
      },
      game_type: 'solve_the_word',
      solve_the_word: {
        rows: rows,
        columns: cols,
        words: this.words
          .filter(w => w.word.trim().length > 0)
          .map(w => ({
            word: w.word.toUpperCase().trim(),
            orientation: w.orientation
          }))
      }
    };
  
    console.log('🔍 Datos de debug:', JSON.stringify(debugData, null, 2));
    return debugData;
  }
}