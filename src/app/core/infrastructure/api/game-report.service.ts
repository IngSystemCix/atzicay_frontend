import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameReportResponse } from '../../domain/interface/game-report-response';
import { environment } from '../../../../environments/environment.development';
@Injectable({ providedIn: 'root' })
export class GameReportService {
  constructor(private http: HttpClient) {}
  private baseUrl = `${environment.api_base_url}game/report`;

  getReport(gameInstanceId: string, limit: number = 6, offset: number = 0): Observable<GameReportResponse> {
    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
    return this.http.get<GameReportResponse>(`${this.baseUrl}/${gameInstanceId}?${params.toString()}`);
  }
}
