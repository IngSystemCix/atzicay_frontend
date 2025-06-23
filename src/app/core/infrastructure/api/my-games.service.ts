import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { MyGamesResponse } from '../../domain/model/my-game.model';

@Injectable({ providedIn: 'root' })
export class MyGamesService {
  private apiUrl = environment.api_base_url;

  constructor(private http: HttpClient) {}

  getMyGames(userId: number, gameType: string = 'all', limit: number = 6, offset: number = 0): Observable<MyGamesResponse> {
    let params = new HttpParams()
      .set('gameType', gameType)
      .set('limit', limit.toString())
      .set('offset', offset.toString());
    return this.http.get<MyGamesResponse>(`${this.apiUrl}my-games/${userId}`, { params });
  }
}
