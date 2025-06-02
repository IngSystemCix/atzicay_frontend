import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {ProgrammingGame} from '../../../domain/model/programmingGame/programming-game';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ProgrammingGameService {

  private apiUrl = environment.api_base_url + 'programming-games';

  constructor(private http: HttpClient) { }

  getAllProgrammingGames(): Observable<ProgrammingGame[]> {
    return this.http.get<{ data: ProgrammingGame[] }>(this.apiUrl).pipe(
      map(response => response.data.map(pg => new ProgrammingGame(pg)))
    );
  }

  getProgrammingGameById(id: number): Observable<ProgrammingGame> {
    return this.http.get<ProgrammingGame>(`${this.apiUrl}/${id}`);
  }

  createProgrammingGame(programmingGame: ProgrammingGame): Observable<ProgrammingGame> {
    return this.http.post<ProgrammingGame>(this.apiUrl, programmingGame);
  }

  updateProgrammingGame(id: number, programmingGame: ProgrammingGame): Observable<ProgrammingGame> {
    return this.http.put<ProgrammingGame>(`${this.apiUrl}/${id}`, programmingGame);
  }

  deleteProgrammingGame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
