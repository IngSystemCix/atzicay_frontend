import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface UpdateVisibilityRequest {
  status: boolean; // true = público, false = restringido
}

export interface UpdateVisibilityResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    status: boolean; // true = público, false = restringido
    visibility: string; // 'P' o 'R'
  } | null;
}

/**
 * Servicio para actualizar la visibilidad de los juegos
 * 
 * API Response visibility values:
 * - 1 = Público
 * - 0 = Restringido
 * 
 * API Request status values:
 * - 1 = Hacer público (cambia a 1)
 * - 0 = Hacer restringido (cambia a 0)
 */
@Injectable({ providedIn: 'root' })
export class UpdateVisibilityService {
  private baseUrl = environment.api_base_url;

  constructor(private http: HttpClient) {}

  /**
   * Actualiza la visibilidad de un juego
   * @param gameInstanceId ID de la instancia del juego
   * @param status 1 para activar, 0 para desactivar
   * @returns Observable con la respuesta del servidor
   */
  updateVisibility(gameInstanceId: number, status: boolean): Observable<UpdateVisibilityResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    // Forzar booleano y log para depuración
    const body: UpdateVisibilityRequest = { status: !!status };
    console.log('[UpdateVisibilityService] Enviando body:', body, 'a', `${this.baseUrl}my-game/update-status/${gameInstanceId}`);
    const url = `${this.baseUrl}my-game/update-status/${gameInstanceId}`;
    return this.http.put<UpdateVisibilityResponse>(url, body, { headers });
  }

  /**
   * Función de prueba para depurar la actualización de visibilidad
   */
  testUpdateVisibility(gameInstanceId: number, status: boolean): void {
    const url = `${this.baseUrl}my-game/update-status/${gameInstanceId}`;
    const body: UpdateVisibilityRequest = { status };
    
  }
}
