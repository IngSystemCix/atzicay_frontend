import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { GameSetting } from '../../domain/interface/game-setting';

export interface ProgrammingGameConfig {
  ProgrammerId: number;
  ProgrammingGameName: string;
  StartTime: string;
  EndTime: string;
  Attempts: number;
  MaximumTime: number;
}


@Injectable({
  providedIn: 'root'
})
export class ProgrammingGameService {
  private apiUrl = `${environment.api_base_url}game-instances/programming`;

  constructor(private http: HttpClient) { }

  updateProgrammingGame(gameId: number, config: ProgrammingGameConfig): Observable<any> {
    return this.http.post(`${this.apiUrl}/${gameId}`, config);
  }
}