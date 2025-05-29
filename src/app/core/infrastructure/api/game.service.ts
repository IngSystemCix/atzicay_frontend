import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../../domain/model/api.response';
import { Game } from '../../domain/model/game.model';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = environment.api_base_url;
  private http= inject(HttpClient);
  private imageMap: { [key: string]: string } = {
    Hangman: 'assets/ahorcado.png',
    Memory: 'assets/memoria.png',
    Puzzle: 'assets/rompecabezas.png',
    'Solve the Word': 'assets/pupiletras.png',
  };

  getAllGames(limit: number = 6, offset: number = 0) {
    const token = sessionStorage.getItem('access_token');
    const options = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};

    return this.http
      .get<ApiResponse<Game[]>>(`${this.apiUrl}game-instances/all/${limit}?offset=${offset}`, options)
      .pipe(
        map((response) =>
          response.data.map((game) => ({
            ...game,
            image: this.imageMap[game.type] || 'assets/default-game.png',
          }))
        )
      );
  }

}
