import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {MemoryGame} from '../../../domain/model/memoryGame/memory-game';

@Injectable({
  providedIn: 'root'
})
export class MemoryGameService {

  private apiUrl = 'http://127.0.0.1:8000/api/atzicay/v1/memory-game';

  constructor(private http: HttpClient) { }

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
