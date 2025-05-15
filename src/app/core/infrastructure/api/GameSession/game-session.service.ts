import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {GameSession} from '../../../domain/model/gameSession/game-session';

@Injectable({
  providedIn: 'root'
})
export class GameSessionService {

  private apiUrl = 'http://127.0.0.1:8000/api/atzicay/v1/game-sessions';

  constructor(private http: HttpClient) { }

  getGameSessionById(id: number): Observable<GameSession> {
    return this.http.get<GameSession>(`${this.apiUrl}/${id}`);
  }

  createGameSession(gameSession: GameSession): Observable<GameSession> {
    return this.http.post<GameSession>(this.apiUrl, gameSession);
  }

  updateGameSession(id: number, gameSession: GameSession): Observable<GameSession> {
    return this.http.put<GameSession>(`${this.apiUrl}/${id}`, gameSession);
  }
}
