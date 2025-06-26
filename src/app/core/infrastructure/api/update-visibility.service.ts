import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface UpdateVisibilityRequest {
  status: boolean;
}

@Injectable({ providedIn: 'root' })
export class UpdateVisibilityService {
  private baseUrl = environment.api_base_url; // Ajusta si tu base cambia

  constructor(private http: HttpClient) {}

  updateVisibility(gameInstanceId: number, status: boolean): Observable<any> {
    return this.http.put(`${this.baseUrl}my-game/update-status/${gameInstanceId}`, { status });
  }
}
