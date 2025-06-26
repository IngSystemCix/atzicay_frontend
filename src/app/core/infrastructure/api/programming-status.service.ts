import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { 
  ProgrammingStatusRequest, 
  ProgrammingStatusResponse
} from '../../domain/model/programming-status.model';

@Injectable({
  providedIn: 'root'
})
export class ProgrammingStatusService {
  private readonly baseUrl = `${environment.api_base_url}programming-game`;

  constructor(private http: HttpClient) {}

  /**
   * Actualiza el estado de un juego de programación
   * @param gameInstanceId ID de la instancia del juego
   * @param status 1 = público, 0 = restringido
   */
  setProgrammingGameStatus(gameInstanceId: number, status: number): Observable<ProgrammingStatusResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    const request: ProgrammingStatusRequest = {
      status: status
    };
    
    const url = `${this.baseUrl}/update-status/${gameInstanceId}`;
    
    console.log('🔧 ProgrammingStatusService - Enviando petición:');
    console.log('   URL:', url);
    console.log('   Game Instance ID:', gameInstanceId);
    console.log('   Request body:', request);
    console.log('   Status:', status, '(', status === 1 ? 'PÚBLICO' : 'RESTRINGIDO', ')');
    console.log('   Headers:', headers);
    
    return this.http.put<ProgrammingStatusResponse>(url, request, { headers });
  }
}
