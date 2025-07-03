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
    status: boolean; // El nuevo estado del juego
    visibility: 'P' | 'R'; // La visibilidad en formato de la base de datos
  } | null;
}

/**
 * Servicio para actualizar la visibilidad de los juegos
 * 
 * API Response visibility values:
 * - 'P' = Público
 * - 'R' = Restringido
 * 
 * API Request status values:
 * - true = Hacer público (cambia a 'P')
 * - false = Hacer restringido (cambia a 'R')
 */
@Injectable({ providedIn: 'root' })
export class UpdateVisibilityService {
  private baseUrl = environment.api_base_url;

  constructor(private http: HttpClient) {}

  /**
   * Actualiza la visibilidad de un juego
   * @param gameInstanceId ID de la instancia del juego
   * @param status true para hacer público, false para hacer restringido
   * @returns Observable con la respuesta del servidor
   */
  updateVisibility(gameInstanceId: number, status: boolean): Observable<UpdateVisibilityResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    const body: UpdateVisibilityRequest = { status };
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
