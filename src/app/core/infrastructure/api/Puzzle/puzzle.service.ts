import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Puzzle } from '../../../domain/model/puzzle/puzzle';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PuzzleService {

  private apiUrl = environment.api_base_url + 'puzzles';

  constructor(private http: HttpClient) { }

  getAllPuzzles(): Observable<Puzzle[]> {
    return this.http.get<Puzzle[]>(this.apiUrl);
  }

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
