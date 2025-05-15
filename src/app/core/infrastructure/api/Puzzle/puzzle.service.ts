import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Puzzle } from '../../../domain/model/puzzle/puzzle';

@Injectable({
  providedIn: 'root'
})
export class PuzzleService {

  private apiUrl = 'http://127.0.0.1:8000/api/atzicay/v1/puzzles';

  constructor(private http: HttpClient) { }

  getPuzzleById(id: number): Observable<Puzzle> {
    return this.http.get<Puzzle>(`${this.apiUrl}/${id}`);
  }

  createPuzzle(puzzle: Puzzle): Observable<Puzzle> {
    return this.http.post<Puzzle>(this.apiUrl, puzzle);
  }

  updatePuzzle(id: number, puzzle: Puzzle): Observable<Puzzle> {
    return this.http.put<Puzzle>(`${this.apiUrl}/${id}`, puzzle);
  }
}
