import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {MemoryGame} from '../../../domain/model/memoryGame/memory-game';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class MemoryGameService {

  private apiUrl = environment.api_base_url + 'memory-game';

  constructor(private http: HttpClient) { }

  getAllMemoryGames(professorId:number): Observable<MemoryGame[]> {
    return this.http.get<MemoryGame[]>(this.apiUrl);
  }

  getMemoryGameById(id: number): Observable<MemoryGame> {
    return this.http.get<MemoryGame>(`${this.apiUrl}/${id}`);
  }

  createMemoryGame(memoryGame: MemoryGame): Observable<MemoryGame> {
    return this.http.post<MemoryGame>(this.apiUrl, memoryGame);
  }

  updateMemoryGame(id: number, memoryGame: MemoryGame): Observable<MemoryGame> {
    return this.http.put<MemoryGame>(`${this.apiUrl}/${id}`, memoryGame);
  }
}
