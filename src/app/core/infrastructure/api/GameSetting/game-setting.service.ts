import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {GameSetting} from '../../../domain/model/gameSetting/game-setting';

@Injectable({
  providedIn: 'root'
})
export class GameSettingService {

  private apiUrl = 'http://127.0.0.1:8000/api/atzicay/v1/game-settings';

  constructor(private http: HttpClient) { }

  getGameSettingById(id: number): Observable<GameSetting> {
    return this.http.get<GameSetting>(`${this.apiUrl}/${id}`);
  }

  createGameSetting(gameSetting: GameSetting): Observable<GameSetting> {
    return this.http.post<GameSetting>(this.apiUrl, gameSetting);
  }

  updateGameSetting(id: number, gameSetting: GameSetting): Observable<GameSetting> {
    return this.http.put<GameSetting>(`${this.apiUrl}/${id}`, gameSetting);
  }
}
