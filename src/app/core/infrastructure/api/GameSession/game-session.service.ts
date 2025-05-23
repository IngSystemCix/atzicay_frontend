import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {GameSession} from '../../../domain/model/gameSession/game-session';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class GameSessionService {

  private apiUrl = environment.api_base_url + 'game-sessions';

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
