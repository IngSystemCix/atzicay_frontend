import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface GameEditRequest {
  gameType: 'hangman' | 'memory' | 'puzzle' | 'solve_the_word';
  data: any;
}

export interface GameEditResponse {
  success: boolean;
  code: number;
  message: string;
  data?: any;
}

@Injectable({ providedIn: 'root' })
export class GameEditService {
  private http = inject(HttpClient);
  private apiUrl = environment.api_base_url;

  updateGame(gameInstanceId: number, gameData: GameEditRequest): Observable<GameEditResponse> {
    return this.http.put<GameEditResponse>(`${this.apiUrl}my-game/update/${gameInstanceId}`, gameData);
  }
}
