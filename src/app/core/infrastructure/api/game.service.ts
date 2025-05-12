import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../../domain/model/api.response';
import { Game } from '../../domain/model/game.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://127.0.0.1:8000/api/atzicay/v1/';
  private http= inject(HttpClient);
  private imageMap: { [key: string]: string } = {
    Hangman: 'assets/ahorcado.png',
    Memory: 'assets/memoria.png',
    Puzzle: 'assets/rompecabezas.png',
    'Solve the Word': 'assets/pupiletras.png',
  };

  getAllGames() {
    return this.http
      .get<ApiResponse<Game[]>>(`${this.apiUrl}game-instances/all`)
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
