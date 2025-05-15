import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {GameProgress} from '../../../domain/model/gameProgress/game-progress';

@Injectable({
  providedIn: 'root'
})
export class GameProgressService {

  private apiUrl = 'http://127.0.0.1:8000/api/atzicay/v1/game-progress';

  constructor(private http: HttpClient) { }

  getGameProgressById(id: number): Observable<GameProgress> {
    return this.http.get<GameProgress>(`${this.apiUrl}/${id}`);
  }

  createGameProgress(gameProgress: GameProgress): Observable<GameProgress> {
    return this.http.post<GameProgress>(this.apiUrl, gameProgress);
  }

  updateGameProgress(id: number, gameProgress: GameProgress): Observable<GameProgress> {
    return this.http.put<GameProgress>(`${this.apiUrl}/${id}`, gameProgress);
  }
}
