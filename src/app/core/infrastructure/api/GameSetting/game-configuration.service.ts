import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameConfiguration } from '../../../domain/model/game-configuration.model';
import { environment } from '../../../../../environments/environment.development';

interface GameConfigurationResponse {
  success: boolean;
  code: number;
  message: string;
  data: GameConfiguration;
}

@Injectable({ providedIn: 'root' })
export class GameConfigurationService {
  private apiUrl = environment.api_base_url;

  constructor(private http: HttpClient) {}

  getGameConfiguration(gameInstanceId: number): Observable<GameConfigurationResponse> {
    return this.http.get<GameConfigurationResponse>(
      `${this.apiUrl}game/settings/${gameInstanceId}`
    );
  }
}




