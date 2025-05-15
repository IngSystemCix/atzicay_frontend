import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { GameInstance } from '../../../domain/model/gameInstance/game-instance';

@Injectable({
  providedIn: 'root'
})
export class GameInstanceService {

  private apiUrl = 'http://127.0.0.1:8000/api/atzicay/v1/game-instances';

  constructor(private http: HttpClient) { }

  getAllGameInstances(): Observable<GameInstance[]> {
    return this.http.get<{ data: GameInstance[] }>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getAllGames(): Observable<GameInstance[]> {
    return this.http.get<{ data: GameInstance[] }>(`${this.apiUrl}/all`).pipe(
      map(response => response.data)
    );
  }

  getGameInstanceById(id: number): Observable<GameInstance> {
    return this.http.get<GameInstance>(`${this.apiUrl}/${id}`);
  }

  createGameInstance(gameInstance: GameInstance): Observable<GameInstance> {
    return this.http.post<GameInstance>(this.apiUrl, gameInstance);
  }

  updateGameInstance(id: number, gameInstance: GameInstance): Observable<GameInstance> {
    return this.http.put<GameInstance>(`${this.apiUrl}/${id}`, gameInstance);
  }

  deleteGameInstance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
