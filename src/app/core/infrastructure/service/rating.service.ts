import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Rating, RatingRequest, RatingResponse } from '../../domain/model/rating.model';
import { UserSessionService } from './user-session.service';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private http = inject(HttpClient);
  private userSessionService = inject(UserSessionService);
  private apiUrl = environment.api_base_url;

  /**
   * Valora un juego específico
   * @param gameInstanceId ID de la instancia del juego
   * @param ratingData Datos de la valoración (value y comments)
   * @returns Observable con la respuesta de la API
   */
  valueRating(gameInstanceId: number, ratingData: RatingRequest): Observable<RatingResponse> {
    const userId = this.userSessionService.getUserId();
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const url = `${this.apiUrl}rate-game/${gameInstanceId}/${userId}`;
    
    return this.http.post<RatingResponse>(url, ratingData, {
      headers: {
        'Authorization': `Bearer ${this.userSessionService.getToken()}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Verifica si el usuario ya valoró un juego específico
   * @param gameInstanceId ID de la instancia del juego
   * @returns Observable<boolean>
   */
  hasUserRatedGame(gameInstanceId: number): Observable<boolean> {
    const userId = this.userSessionService.getUserId();
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const url = `${this.apiUrl}/check-rating/${gameInstanceId}/${userId}`;
    
    return this.http.get<{ hasRated: boolean }>(url, {
      headers: {
        'Authorization': `Bearer ${this.userSessionService.getToken()}`
      }
    }).pipe(
      // Extraer solo el boolean del response
      map((response: any) => response.hasRated || false)
    );
  }
}
