import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { GameConfiguration } from '../../domain/model/game-configuration.model';
import { UserSessionService } from '../service/user-session.service';
import { environment } from '../../../../environments/environment.development';

interface GameConfigurationResponse {
  success: boolean;
  code: number;
  message: string;
  data: GameConfiguration;
}

@Injectable({ providedIn: 'root' })
export class GameConfigurationService {
  private http = inject(HttpClient);
  private userSessionService = inject(UserSessionService);
  private apiUrl = environment.api_base_url;

  getGameConfiguration(gameInstanceId: number): Observable<GameConfigurationResponse> {
    return this.userSessionService.waitForToken$().pipe(
      switchMap((token) => {
        return this.http.get<GameConfigurationResponse>(
          `${this.apiUrl}game/settings/${gameInstanceId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
      })
    );
  }
}




