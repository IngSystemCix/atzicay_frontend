import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';


export interface RatingRequest {
  value: number;
  comments: string;
}

export interface RatingResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private http = inject(HttpClient);
  private apiUrl = environment.api_base_url;

  /**
   * Envía la valoración del juego al backend
   * @param gameInstanceId ID de la instancia del juego
   * @param userId ID del usuario
   * @param rating Valoración con estrellas y comentarios
   * @returns Observable con la respuesta del servidor
   */
  rateGame(gameInstanceId: number, userId: number, rating: RatingRequest): Observable<RatingResponse> {
    const url = `${this.apiUrl}rate-game/${gameInstanceId}/${userId}`;
    return this.http.post<RatingResponse>(url, rating);
  }
}
