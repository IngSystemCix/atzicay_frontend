import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Auth, AuthResponse } from '../../domain/model/auth.model';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.api_base_url;
  private http = inject(HttpClient);

  login(idToken: string): Observable<Auth> {
    const body = { id_token: idToken };
    return this.http.post<AuthResponse>(`${this.apiUrl}auth/login`, body).pipe(
      map((response) => {
        const auth: Auth = {
          access_token: response.access_token,
          user: {
            Name: response.user.Name,
            Email: response.user.Email,
          },
        };
        return auth;
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}auth/logout`, {
      Headers: {
        Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
      }
    });
  }
}
