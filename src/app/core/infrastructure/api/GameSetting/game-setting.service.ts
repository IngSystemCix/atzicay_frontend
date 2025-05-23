import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {GameSetting} from '../../../domain/model/gameSetting/game-setting';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class GameSettingService {

  private apiUrl = environment.api_base_url + 'game-settings';

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
