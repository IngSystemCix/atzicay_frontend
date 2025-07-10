import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface PrivacyResponse {
  success: boolean;
  code: number;
  message: string;
  data?: any;
}

@Injectable({ providedIn: 'root' })
export class GamePrivacyService {
  private baseUrl = environment.api_base_url;

  constructor(private http: HttpClient) {}

  /**
   * Cambia la privacidad de un juego (Público o Privado)
   * @param gameInstanceId ID de la instancia del juego
   * @param privacy 'P' para público, 'R' para privado
   */
  updatePrivacy(gameInstanceId: number, privacy: 'P' | 'R'): Observable<PrivacyResponse> {
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });
    const url = `${this.baseUrl}game/${gameInstanceId}/privacy/${privacy}`;
    return this.http.put<PrivacyResponse>(url, null, { headers });
  }
}
