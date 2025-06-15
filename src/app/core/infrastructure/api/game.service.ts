// src/app/core/infrastructure/api/game.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../../domain/model/api.response';
import { Game } from '../../domain/model/game.model';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private apiUrl = environment.api_base_url;
  private http = inject(HttpClient);
  private limitSubject = new BehaviorSubject<number>(6);
  private imageMap: { [key: string]: string } = {
    Hangman: 'assets/ahorcado.png',
    Memory: 'assets/memoria.png',
    Puzzle: 'assets/rompecabezas.png',
    'Solve the Word': 'assets/pupiletras.png',
  };

  // Método para actualizar el limit
  setLimit(limit: number) {
    this.limitSubject.next(limit);
  }

  // Observable que se actualiza automáticamente cuando cambia el limit
  getAllGames(limit: number, offset: number): Observable<Game[]> {
    const token = sessionStorage.getItem('access_token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http
      .get<ApiResponse<Game[]>>(
        `${this.apiUrl}game-instances/all?limit=${limit}&offset=${offset}`,
        headers ? { headers } : {}
      )
      .pipe(
        map((response: ApiResponse<Game[]>) =>
          response.data.map((game: Game) => ({
            ...game,
            image: this.imageMap[game.type] || 'assets/default-game.png',
          }))
        )
      );
  }
}
