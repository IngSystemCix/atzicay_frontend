import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { 
  UpdateStatusRequest, 
  UpdateStatusResponse
} from '../../domain/model/update-status.model';

@Injectable({
  providedIn: 'root'
})
export class UpdateStatusService {
  private readonly baseUrl = `${environment.api_base_url}game-instances`;

  constructor(private http: HttpClient) {}

  /**
   * Actualiza el estado de una instancia de juego
   * @param gameInstanceId ID de la instancia del juego
   * @param isActive true = activo, false = inactivo
   */
  updateStatusGameInstance(gameInstanceId: number, isActive: boolean): Observable<UpdateStatusResponse> {
    const request: UpdateStatusRequest = {
      status: isActive
    };
    
    return this.http.put<UpdateStatusResponse>(`${this.baseUrl}/${gameInstanceId}/status`, request);
  }
}
