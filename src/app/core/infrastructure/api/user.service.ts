// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';
import { switchMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.api_base_url;

  constructor(private http: HttpClient, private auth: AuthService) {}

  // Buscar usuario por email
  findUserByEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}users/find`, { Email: email }).pipe(
      catchError(() => of(null))
    );
  }

  // Crear un nuevo usuario
  private createUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}users`, userData).pipe(
      catchError(error => {
        console.error('Error creating user:', error);
        return of(null);
      })
    );
  }

  // Método público para manejar el usuario
  handleUser(auth0User: any): Observable<any> {
    if (!auth0User?.email) {
      return of(null);
    }

    return this.findUserByEmail(auth0User.email).pipe(
      switchMap((response: any) => {
        if (response && response.data) {
          // Usuario existe, podemos actualizarlo si es necesario
          return this.updateUserIfNeeded(response.data.Id, auth0User);
        } else {
          // Usuario no existe, crear uno nuevo
          return this.createNewUser(auth0User);
        }
      })
    );
  }

  private createNewUser(auth0User: any): Observable<any> {
    const userDto = {
      Activated: true,
      GoogleId: auth0User.sub,
      Email: auth0User.email,
      Name: this.getFirstName(auth0User),
      LastName: this.getLastName(auth0User),
      Gender: 'O',
      CountryId: 1,
      City: 'Desconocida',
      Birthdate: '2000-01-01',
      CreatedAt: new Date().toISOString()
    };

    return this.createUser(userDto);
  }

  private updateUserIfNeeded(_userId: number, _auth0User: any): Observable<any> {
    // Aquí podrías implementar lógica para actualizar datos si es necesario
    return of({ success: true, message: 'User exists' });
  }

  private getFirstName(auth0User: any): string {
    return auth0User.given_name ||
      auth0User.name?.split(' ')[0] ||
      'Usuario';
  }

  private getLastName(auth0User: any): string {
    return auth0User.family_name ||
      auth0User.name?.split(' ').slice(1).join(' ') ||
      '';
  }
}
