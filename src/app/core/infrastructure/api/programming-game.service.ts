import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProgrammingGame } from '../../domain/model/programming-game.model';
import { environment } from '../../../../environments/environment.development';
@Injectable({ providedIn: 'root' })
export class ProgrammingGameService {
  private baseUrl = `${environment.api_base_url}programming-game`;

  constructor(private http: HttpClient) {}

  createProgrammingGame(gameInstanceId: number, userId: number, data: ProgrammingGame): Observable<any> {
    const url = `${this.baseUrl}/create/${gameInstanceId}/${userId}`;
    return this.http.post<any>(url, data);
  }
}
