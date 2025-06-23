import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { GameTypeCounts } from '../../domain/model/game-type-counts.model';

interface GameTypeCountsResponse {
  success: boolean;
  code: number;
  message: string;
  data: GameTypeCounts;
}

@Injectable({ providedIn: 'root' })
export class GameTypeCountsService {
  private apiUrl = environment.api_base_url;

  constructor(private http: HttpClient) {}

  getGameTypeCountsByUser(userId: number): Observable<GameTypeCountsResponse> {
    return this.http.get<GameTypeCountsResponse>(
      `${this.apiUrl}game/amount-by-type/${userId}`
    );
  }
}
