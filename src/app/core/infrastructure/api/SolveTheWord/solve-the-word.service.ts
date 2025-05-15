import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {SolveTheWord} from '../../../domain/model/solveTheWord/solve-the-word';

@Injectable({
  providedIn: 'root'
})
export class SolveTheWordService {

  private apiUrl = 'http://127.0.0.1:8000/api/atzicay/v1/solve-the-word';

  constructor(private http: HttpClient) { }

  getSolveTheWordById(id: number): Observable<SolveTheWord> {
    return this.http.get<SolveTheWord>(`${this.apiUrl}/${id}`);
  }

  createSolveTheWord(solveTheWord: SolveTheWord): Observable<SolveTheWord> {
    return this.http.post<SolveTheWord>(this.apiUrl, solveTheWord);
  }

  updateSolveTheWord(id: number, solveTheWord: SolveTheWord): Observable<SolveTheWord> {
    return this.http.put<SolveTheWord>(`${this.apiUrl}/${id}`, solveTheWord);
  }
}
