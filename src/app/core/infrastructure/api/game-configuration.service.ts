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

  getGameConfiguration(gameInstanceId: number, userId?: number, withProgrammings: boolean = false): Observable<GameConfigurationResponse> {
    return this.userSessionService.waitForToken$().pipe(
      switchMap((token) => {
        // Construir parámetros de consulta
        const params = new URLSearchParams();
        if (userId) {
          params.append('userId', userId.toString());
        }
        params.append('withProgrammings', withProgrammings.toString());

        const queryString = params.toString();
        const url = `${this.apiUrl}game/settings/${gameInstanceId}${queryString ? '?' + queryString : ''}`;

        return this.http.get<GameConfigurationResponse>(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      })
    );
  }
}




