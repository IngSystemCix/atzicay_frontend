import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Word } from '../../../domain/model/word/word';

@Injectable({
  providedIn: 'root'
})
export class WordService {

  private apiUrl = 'http://127.0.0.1:8000/api/atzicay/v1/words';

  constructor(private http: HttpClient) { }

  getWordById(id: number): Observable<Word> {
    return this.http.get<Word>(`${this.apiUrl}/${id}`);
  }

  createWord(word: Word): Observable<Word> {
    return this.http.post<Word>(this.apiUrl, word);
  }

  updateWord(id: number, word: Word): Observable<Word> {
    return this.http.put<Word>(`${this.apiUrl}/${id}`, word);
  }
}
