import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { MyProgrammingGamesResponse } from '../../domain/model/my-programming-game.model';

@Injectable({ providedIn: 'root' })
export class MyProgrammingGamesService {
  private apiUrl = environment.api_base_url;

  constructor(private http: HttpClient) {}

  getMyProgrammingGames(
    userId: number,
    gameType: string = 'all',
    limit: number = 6,
    offset: number = 0,
    startDate?: string,
    endDate?: string,
    exactStartDate?: string,
    exactEndDate?: string
  ): Observable<MyProgrammingGamesResponse> {
    let params = new HttpParams()
      .set('gameType', gameType)
      .set('limit', limit.toString())
      .set('offset', offset.toString());
    if (startDate && endDate) {
      params = params.set('startDate', startDate).set('endDate', endDate);
    } else if (exactStartDate) {
      params = params.set('exactStartDate', exactStartDate);
    } else if (exactEndDate) {
      params = params.set('exactEndDate', exactEndDate);
    }
    return this.http.get<MyProgrammingGamesResponse>(`${this.apiUrl}my-programming-games/${userId}`, { params });
  }
}
