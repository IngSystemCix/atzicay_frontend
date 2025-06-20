import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';

export interface GameConfiguration {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  visibility: string;
  activated: boolean;
  rating: number;
  assessment: Assessment[];
  author: string;
  type: string;
  settings: GameSetting[];
  game_data: GameData;
}

export interface Assessment {
  value: number;
  comments: string;
}

export interface HangmanData {
  word: string;
  clue: string;
  presentation: 'A' | 'F';
}

export interface GameSetting {
  key: string;
  value: string;
}

export interface GameData {
  hangman_data?: HangmanData[];
  // Otras propiedades para otros tipos de juego
  rows?: number;
  columns?: number | null;
  words?: { word: string; orientation: string }[];
  // Propiedades para Memory
  mode?: string;
  path_img1?: string;
  path_img2?: string;
  description_img?: string;
  clue?: string;
  word?:string
  presentation?: 'A' | 'F'; 
  // Propiedades para Puzzle
  pieces?: number;
  image_url?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
@Injectable({
  providedIn: 'root'
})
export class GameConfigurationService {

  private apiUrl = environment.api_base_url;

  constructor(private http: HttpClient) {}

  // Volver a usar id: number
  getGameConfiguration(id: number): Observable<ApiResponse<GameConfiguration>> {
    return this.http.get<ApiResponse<GameConfiguration>>(`${this.apiUrl}game-instances/configuration/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404 && error.error?.data) {
          console.warn('Se recibió data a pesar del 404:', error.error.data);
          return of({
            success: error.error.status === 'success',
            message: error.error.message || 'Datos recuperados aunque hubo 404',
            data: error.error.data
          });
        }
        if (error.error?.status === 'success') {
          return of({
            success: true,
            message: error.error.message || 'Configuración cargada',
            data: error.error.data
          });
        }
        console.error('Error real:', error);
        return throwError(() => new Error('No se pudo cargar la configuración.'));
      })
    );
  }

  // Volver a usar id: number
  updateGameConfiguration(id: number, config: Partial<GameConfiguration>): Observable<ApiResponse<GameConfiguration>> {
    return this.http.put<ApiResponse<GameConfiguration>>(`${this.apiUrl}/configuration/${id}`, config).pipe(
      catchError((error) => {
        console.error('Error al guardar:', error);
        return throwError(() => new Error('No se pudo actualizar la configuración.'));
      })
    );
  }
}
    
  
  

