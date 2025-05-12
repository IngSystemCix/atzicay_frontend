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

  getAllGames() {
    return this.http.get<ApiResponse<Game[]>>(`${this.apiUrl}game-instances/all`).pipe(
      map(response => response.data.map(game => ({
        ...game,
        image: 'assets/images/default-game.png' // ruta a tu imagen por defecto
      })))
    );
  }

}
