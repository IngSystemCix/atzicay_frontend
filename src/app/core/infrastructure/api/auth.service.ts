import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Auth, AuthResponse } from '../../domain/model/auth.model';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { UserSessionService } from '../service/user-session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.api_base_url;
  private http = inject(HttpClient);
  private userSessionService = inject(UserSessionService);

  /**
   * Realiza el login con el id token de Auth0 y devuelve un observable con la información del usuario autenticado.
   * Guarda el token JWT interno en sessionStorage con clave 'token_jwt'.
   */
  login(idToken: string): Observable<Auth> {
    const body = { id_token: idToken };
    return this.http
      .post<AuthResponse>(`${this.apiUrl}auth/generate-token`, body)
      .pipe(
        map((response) => {
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

  /**
   * Solicita un nuevo token JWT al backend.
   * Usa el token actual como autorización para solicitar uno nuevo.
   */
  refreshToken(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(`${this.apiUrl}auth/refresh-token`, {}, { headers });
  }

  /**
   * Limpia sesión del usuario.
   * Nota: la navegación al login debe manejarse en el componente.
   */
  logout(): void {
    this.userSessionService.clearSession();
  }

  isAuthenticated(): boolean {
    return this.userSessionService.isAuthenticated();
  }

}
