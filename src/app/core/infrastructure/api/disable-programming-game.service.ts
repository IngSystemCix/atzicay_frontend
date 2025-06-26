import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class DisableProgrammingGameService {
  private baseUrl = environment.api_base_url;

  constructor(private http: HttpClient) {}

  disableProgrammingGame(gameInstanceId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}disable-programming-game/${gameInstanceId}`, {});
  }
}
