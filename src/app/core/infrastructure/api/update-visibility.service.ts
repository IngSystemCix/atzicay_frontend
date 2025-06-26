import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface UpdateVisibilityRequest {
  status: boolean;
}

@Injectable({ providedIn: 'root' })
export class UpdateVisibilityService {
  private baseUrl = environment.api_base_url;

  constructor(private http: HttpClient) {}

  updateVisibility(gameInstanceId: number, status: boolean): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    const body: UpdateVisibilityRequest = { status };
    const url = `${this.baseUrl}my-game/update-status/${gameInstanceId}`;
    
    console.log('Enviando PUT request a:', url);
    console.log('Con body:', body);
    console.log('Con headers:', headers);
    
    return this.http.put(url, body, { headers });
  }
}
