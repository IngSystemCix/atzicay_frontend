import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameReportResponse } from '../../domain/interface/game-report-response';
import { environment } from '../../../../environments/environment.development';
@Injectable({ providedIn: 'root' })
export class GameReportService {
  constructor(private http: HttpClient) {}
  private baseUrl = `${environment.api_base_url}game/report`;

  getReport(gameInstanceId: string): Observable<GameReportResponse> {
    return this.http.get<GameReportResponse>(`${this.baseUrl}/${gameInstanceId}`);
  }
}
