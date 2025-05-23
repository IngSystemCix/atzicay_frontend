import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {SolveTheWord} from '../../../domain/model/solveTheWord/solve-the-word';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SolveTheWordService {

  private apiUrl = environment.api_base_url + 'solve-the-word';

  constructor(private http: HttpClient) { }

  getAllSolveTheWords(): Observable<SolveTheWord[]> {
    return this.http.get<SolveTheWord[]>(this.apiUrl);
  }

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
