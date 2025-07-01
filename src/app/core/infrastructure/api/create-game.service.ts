import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { CreateGame } from '../../domain/model/create-game.model';

@Injectable({ providedIn: 'root' })
export class CreateGameService {
  private apiUrl = environment.api_base_url;

  constructor(private http: HttpClient) {}

  createGame(userId: number, gameType: string, data: CreateGame): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}my-game/create/${userId}?gameType=${gameType}`,
      data 
    );
  }

  /**
   * Crea un juego de hangman usando el wrapper { gameType, data }
   */
  createHangmanGame(userId: number, body: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}my-game/create/${userId}`,
      body
    );
  }

  /**
   * Crea un juego de puzzle usando el wrapper { gameType, data }
   */
  createPuzzleGame(userId: number, body: any): Observable<any> {
    const url = `${this.apiUrl}my-game/create/${userId}`;
    console.log('POST URL:', url);
    console.log('POST BODY:', JSON.stringify(body, null, 2));
    return this.http.post<any>(
      url,
      body
    );
  }

  createSolveTheWordGame(userId: number, body: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}my-game/create/${userId}`,
      body
    );
  }

  /**
   * Crea un juego de memoria con pares de imágenes o imagen-descripción
   * @param userId ID del usuario
   * @param body Objeto con los datos del juego en formato { gameType, data }
   */
  createMemoryGame(userId: number, body: any): Observable<any> {
    const url = `${this.apiUrl}my-game/create/${userId}`;
    console.log('POST URL:', url);
    console.log('POST BODY:', JSON.stringify(body, null, 2));
    return this.http.post<any>(url, body);
  }
}
