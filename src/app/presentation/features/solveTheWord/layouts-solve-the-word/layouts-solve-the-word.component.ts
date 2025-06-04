import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Difficulty } from '../../../../core/domain/enum/difficulty';
import { GameService } from '../../../../core/infrastructure/api/createGame/game.service';
import { CreateGame } from '../../../../core/domain/interface/create-game';
import { Visibility } from '../../../../core/domain/enum/visibility';
import { SolveTheWordData } from '../../../../core/domain/interface/solve-the-word-data';
import { Orientation } from '../../../../core/domain/enum/orientacion';
import { UserService } from '../../../../core/infrastructure/api/user.service';

@Component({
  selector: 'app-layouts-solve-the-word',
  imports: [CommonModule, FormsModule],
  templateUrl: './layouts-solve-the-word.component.html',
  styleUrl: './layouts-solve-the-word.component.css'
})
export class LayoutsSolveTheWordComponent implements OnInit {
  activeTab: string = 'contenido';

  // Contenido tab data
  gameTitle: string = '';
  gameDescription: string = '';
  gridSize: string = '10 x 10';

  // Palabras data
  words: Array<{id: number, word: string, orientation: Orientation}> = [
    {id: 1, word: '', orientation: Orientation.HORIZONTAL_LEFT} 
  ];

  // Variables para configuración
  fontFamily: string = '';
  backgroundColor: string = 'gray';
  fontColor: string = 'gray';
  successMessage: string = '';
  failureMessage: string = '';
  isPublicGame: boolean = true;

  // Variables para dificultad y profesor - CORREGIDO: Solo una variable para el ID
  difficulty: Difficulty = Difficulty.MEDIUM;
  professorId: number = 0; // Inicializar en 0, se cargará en ngOnInit

  // Available colors
  colorOptions = [
    { name: 'gray', class: 'bg-gray-300' },
    { name: 'cyan', class: 'bg-cyan-300' },
    { name: 'purple', class: 'bg-purple-300' },
    { name: 'rainbow', class: 'bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400' }
  ];

  constructor(
    private gameService: GameService,
    private router: Router,
    private usuarioService: UserService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadUserData();
  }

  private async loadUserData(): Promise<void> {
    try {
      const userString = sessionStorage.getItem('user');
      if (!userString) {
        throw new Error('No hay usuario en sesión');
      }
      
      const user = JSON.parse(userString);
      const email = user?.Email;
      if (!email) {
        throw new Error('El usuario no tiene email registrado');
      }

      // Obtener el ID del usuario desde el servicio
      const userResponse = await this.usuarioService.findUserByEmail(email).toPromise();
      if (!userResponse?.data?.Id) {
        throw new Error('ID de usuario no válido');
      }
      
      // CORREGIDO: Asignar a la variable correcta
      this.professorId = userResponse.data.Id;
      console.log('ID del profesor obtenido:', this.professorId);
      
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      // Valor por defecto si falla la carga
      this.professorId = 1;
      console.warn('Usando ID de profesor por defecto:', this.professorId);
    }
  }

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

    // CORREGIDO: Verificar que el professorId esté cargado
    if (!this.professorId || this.professorId === 0) {
      alert('Error: No se pudo obtener el ID del usuario. Por favor, recarga la página.');
      return;
    }

    const [rows, cols] = this.gridSize.split(' x ').map(size => parseInt(size.trim()));

    const gameInfo: Omit<CreateGame, 'game_type' | 'solve_the_word'> = {
      Name: this.gameTitle,
      Description: this.gameDescription,
      ProfessorId: this.professorId, // CORREGIDO: Usar la variable correcta
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
      ProfessorId: this.professorId, // CORREGIDO: Usar la variable correcta
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