import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  /**
   * Realiza el login con el id token de Auth0 y devuelve un observable con la informacion del usuario autenticado.
   * @param idToken id token de Auth0
   * @returns observable con la informacion del usuario autenticado
   */

  login(idToken: string): Observable<Auth> {
    const body = { id_token: idToken };
    return this.http
      .post<AuthResponse>(`${this.apiUrl}auth/generate-token`, body)
      .pipe(
        map((response) => {
          // Guarda el id del usuario autenticado en sessionStorage
          if (response.user && response.user.Id) {
            sessionStorage.setItem('user_id', response.user.Id.toString());
          }
          const auth: Auth = {
            access_token: response.access_token,
            token_type: response.token_type,
            expires_in: response.expires_in,
            user: {
              Id: response.user.Id,
              Email: response.user.Email,
              Name: response.user.Name,
              LastName: response.user.LastName,
              Gender: response.user.Gender,
              CountryId: response.user.CountryId,
              City: response.user.City,
              Birthdate: response.user.Birthdate,
              CreatedAt: response.user.CreatedAt,
            },
          };
          return auth;
        })
      );
  }

  refreshToken(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(
      `${this.apiUrl}auth/refresh-token`,
      {},
      { headers }
    );
  }

  logout(): void {
    sessionStorage.clear();
    // La navegación debe hacerse desde el componente, no desde el servicio para evitar dependencias circulares
  }
}
