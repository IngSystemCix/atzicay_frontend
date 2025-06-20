import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';
import { ProgrammingGame } from '../../../domain/interface/programming-game';

@Injectable({
  providedIn: 'root',
})
export class ProgrammingGameService {
  private apiUrl = environment.api_base_url + 'programming-games';

  constructor(private http: HttpClient) {}

  getAllProgrammingGames(): Observable<ProgrammingGame[]> {
    return this.http
      .get<{ data: ProgrammingGame[] }>(this.apiUrl)
      .pipe(
        map((response) => response.data.map((pg) => new ProgrammingGame(pg)))
      );
  }

  getProgrammingGameById(id: number): Observable<ProgrammingGame> {
    return this.http
      .get<{ data: ProgrammingGame }>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => new ProgrammingGame(response.data)));
  }

  filterProgrammingGamesByDateAndGame(
    gameId: number,
    startDate?: string,
    endDate?: string
  ): Observable<ProgrammingGame[]> {
    let url = `${environment.api_base_url}game-instances/programming/filter/${gameId}`;

    const params: string[] = [];
    if (startDate) params.push(`start=${startDate}`);
    if (endDate) params.push(`end=${endDate}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http
      .get<{ data: any[] }>(url)
      .pipe(
        map((response) =>
          response.data.map((game) => new ProgrammingGame(game))
        )
      );
  }

  getProgrammingGamesByGameInstanceId(
    gameInstanceId: number
  ): Observable<ProgrammingGame[]> {
    return this.http
      .get<{ data: ProgrammingGame[] }>(
        `${this.apiUrl}/by-game-instance/${gameInstanceId}`
      )
      .pipe(
        map((response) => response.data.map((pg) => new ProgrammingGame(pg)))
      );
  }

  createProgrammingGame(
    programmingGame: ProgrammingGame
  ): Observable<ProgrammingGame> {
    return this.http.post<ProgrammingGame>(this.apiUrl, programmingGame);
  }

  updateProgrammingGame(
    id: number,
    programmingGame: ProgrammingGame
  ): Observable<ProgrammingGame> {
    return this.http.put<ProgrammingGame>(
      `${this.apiUrl}/${id}`,
      programmingGame
    );
  }

  deleteProgrammingGame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
