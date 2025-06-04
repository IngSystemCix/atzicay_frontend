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

export interface GameSetting {
  key: string;
  value: string;
}

export interface GameData {
  word: string;
  clue: string;
  presentation: string;
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

  getGameConfiguration(id: number): Observable<ApiResponse<GameConfiguration>> {
    return this.http.get<ApiResponse<GameConfiguration>>(`${this.apiUrl}game-instances/configuration/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404 && error.error?.data) {
          console.warn('Se recibió data a pesar del 404:', error.error.data);
          // Devuelve los datos aunque haya un 404
          return of({
            success: error.error.status === 'success',
            message: error.error.message || 'Datos recuperados aunque hubo 404',
            data: error.error.data
          });
        }

        // Otros errores — lanzar excepción
        console.error('Error real:', error);
        return throwError(() => new Error('No se pudo cargar la configuración.'));
      })
    );
  }

  updateGameConfiguration(id: number, config: Partial<GameConfiguration>): Observable<ApiResponse<GameConfiguration>> {
    return this.http.put<ApiResponse<GameConfiguration>>(`${this.apiUrl}/configuration/${id}`, config).pipe(
      catchError((error) => {
        console.error('Error al guardar:', error);
        return throwError(() => new Error('No se pudo actualizar la configuración.'));
      })
    );
  }
}
