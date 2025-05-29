import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {environment} from '../../../../../environments/environment.development';
import { GameInstance } from '../../../domain/interface/game-instance';
import {ApiResponse} from '../../../domain/interface/api-response';
import {HangmanData} from '../../../domain/interface/hangman-data';
import {GameType} from '../../../domain/enum/game-type';
import {MemoryGameData} from '../../../domain/interface/memory-game-data';
import {PuzzleData} from '../../../domain/interface/puzzle-data';
import {SolveTheWordData} from '../../../domain/interface/solve-the-word-data';
import {Visibility} from '../../../domain/enum/visibility';
import {Difficulty} from '../../../domain/enum/difficulty';
import {CreateGame} from '../../../domain/interface/create-game';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly baseUrl = environment.api_base_url;
  private readonly gameEndpoint = 'game-instances/game';

  constructor(private http: HttpClient) {}
  /**
   * Crea un nuevo juego
   */
  createGame(gameData: CreateGame): Observable<GameInstance> {
    const url = `${this.baseUrl}${this.gameEndpoint}`;
    const headers = this.getHeaders();

    return this.http.post(url, gameData, { headers }).pipe(
      map(response => {
        console.log('📥 Respuesta completa del servidor:', response);

        // Caso 1: Respuesta directa con Id (ej. { Id: 1, Name: 'Juego...' })
        if (response && typeof (response as any).Id !== 'undefined') {
          return response as GameInstance;
        }

        // Caso 2: Respuesta envuelta en ApiResponse personalizado (como el que muestras)
        if ((response as any).status === 'success' && (response as any).data) {
          return (response as any).data as GameInstance;
        }

        // Caso 3: Respuesta con propiedad success y data
        if ((response as any).success && (response as any).data) {
          return (response as any).data as GameInstance;
        }

        // Caso 4: No se encontró una estructura válida
        throw new Error('Formato de respuesta del servidor no reconocido');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Crea un juego de tipo Hangman
   */
  createHangmanGame(
    gameInfo: Omit<CreateGame, 'game_type' | 'hangman'>,
    hangmanData: HangmanData
  ): Observable<GameInstance> {
    const gameRequest: CreateGame = {
      ...gameInfo,
      game_type: GameType.HANGMAN,
      hangman: hangmanData
    };
    return this.createGame(gameRequest);
  }

  /**
   * Crea un juego de memoria
   */
  createMemoryGame(
    gameInfo: Omit<CreateGame, 'game_type' | 'memory'>,
    memoryData: MemoryGameData
  ): Observable<GameInstance> {
    const gameRequest: CreateGame = {
      ...gameInfo,
      game_type: GameType.MEMORY,
      memory: memoryData
    };

    return this.createGame(gameRequest);
  }

  /**
   * Crea un juego de puzzle
   */
  createPuzzleGame(
    gameInfo: Omit<CreateGame, 'game_type' | 'puzzle'>,
    puzzleData: PuzzleData
  ): Observable<GameInstance> {
    const gameRequest: CreateGame = {
      ...gameInfo,
      game_type: GameType.PUZZLE,
      puzzle: puzzleData
    };

    return this.createGame(gameRequest);
  }

  /**
   * Crea un juego de resolver palabras
   */
  createSolveTheWordGame(
    gameInfo: Omit<CreateGame, 'game_type' | 'solve_the_word'>,
    solveWordData: SolveTheWordData
  ): Observable<GameInstance> {
    const gameRequest: CreateGame = {
      ...gameInfo,
      game_type: GameType.SOLVE_THE_WORD,
      solve_the_word: solveWordData
    };

    return this.createGame(gameRequest);
  }

  /**
   * Valida los datos del juego antes de enviarlos
   */
  validateGameData(gameData: CreateGame): string[] {
    const errors: string[] = [];

    if (!gameData.Name || gameData.Name.trim().length === 0) {
      errors.push('El nombre del juego es requerido');
    }

    if (!gameData.Description || gameData.Description.trim().length === 0) {
      errors.push('La descripción del juego es requerida');
    }

    if (!gameData.ProfessorId || gameData.ProfessorId <= 0) {
      errors.push('El ID del profesor es requerido y debe ser válido');
    }

    if (!Object.values(Difficulty).includes(gameData.Difficulty)) {
      errors.push('La dificultad debe ser E (Fácil), M (Medio) o H (Difícil)');
    }

    if (!Object.values(Visibility).includes(gameData.Visibility)) {
      errors.push('La visibilidad debe ser P (Privado) o U (Público)');
    }

    // Validaciones específicas por tipo de juego
    switch (gameData.game_type) {
      case GameType.HANGMAN:
        if (!gameData.hangman) {
          errors.push('Los datos del juego Hangman son requeridos');
        } else {
          const { hangman } = gameData;

          if (!hangman.word || hangman.word.trim().length < 2) {
            errors.push('La palabra es requerida y debe tener al menos 2 caracteres');
          }

          if (!hangman.presentation || !['A', 'F'].includes(hangman.presentation)) {
            errors.push('El tipo de presentación es requerido (A o F)');
          }
        }
        break;

      case GameType.MEMORY:
        if (!gameData.memory) {
          errors.push('Los datos del juego de memoria son requeridos');
        }
        break;

      case GameType.PUZZLE:
        if (!gameData.puzzle) {
          errors.push('Los datos del puzzle son requeridos');
        } else {
          if (!gameData.puzzle.pieces || gameData.puzzle.pieces <= 0) {
            errors.push('El número de piezas del puzzle debe ser mayor a 0');
          }
        }
        break;

      case GameType.SOLVE_THE_WORD:
        if (!gameData.solve_the_word) {
          errors.push('Los datos del juego de resolver palabras son requeridos');
        } else {
          if (!gameData.solve_the_word.words || gameData.solve_the_word.words.length === 0) {
            errors.push('Debe proporcionar al menos una palabra');
          }
        }
        break;
    }

    return errors;
  }

  /**
   * Headers para las peticiones HTTP
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token'); // O como guardes el token
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }

  /**
   * Manejo de errores
   */
  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      if (error.status === 422) {
        errorMessage = 'Datos de validación incorrectos';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('GameService Error:', error);
    return throwError(() => new Error(errorMessage));
  };
}
