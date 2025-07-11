import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { GameInstance } from '../../domain/model/game-instance.model';

interface GameInstanceResponse {
  success: boolean;
  data: {
    data: GameInstance[];
    total: number;
  };
  message: string;
}

@Injectable({ providedIn: 'root' })
export class GameInstanceService {
  private apiUrl = environment.api_base_url;

  constructor(private http: HttpClient) {}

  getGameInstances(
    search: string = '',
    gameType?: string,
    limit: number = 6,
    offset: number = 0
  ): Observable<GameInstanceResponse> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());
    
    if (search.trim()) {
      params = params.set('search', search.trim());
    }
    
    if (gameType) {
      params = params.set('gameType', gameType);
    }
    
    return this.http.get<GameInstanceResponse>(`${this.apiUrl}game/filter`, { params });
  }
}
