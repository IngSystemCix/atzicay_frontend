import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService, User as Auth0User } from '@auth0/auth0-angular';
import {Observable, switchMap, catchError, of, tap, map} from 'rxjs';
import { User } from '../../../domain/model/users/user';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.api_base_url +  'users';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  handleAuth0User(): Observable<User | null> {
    return this.auth.user$.pipe(
      tap(auth0User => this.logAuth0UserData(auth0User)),
      switchMap(auth0User => {
        if (!auth0User?.email) {
          console.error('Auth0 user email is missing');
          return of(null);
        }

        return this.findUserByEmail(auth0User.email).pipe(
          switchMap(existingUser => {
            if (existingUser) {
              console.log('User already exists:', existingUser);
              return of(existingUser);
            } else {
              const userData = this.mapAuth0ToUser(auth0User);
              console.log('Creating new user with data:', userData);
              return this.createUser(userData);
            }
          })
        );
      }),
      catchError(error => {
        console.error('Error in user handling:', error);
        return of(null);
      })
    );
  }

  private mapAuth0ToUser(auth0User: Auth0User): any {
    return {
      Id: 0,
      Activated: true,
      GoogleId: auth0User.sub || 'unknown-google-id',
      Email: auth0User.email || '',
      Name: auth0User.given_name || auth0User.name?.split(' ')[0] || 'Usuario',
      LastName: auth0User.family_name || auth0User.name?.split(' ').slice(1).join(' ') || 'Apellido',
      Gender: auth0User.gender?.charAt(0).toUpperCase() || 'O', // M, F o O
      CountryId: 1, // Perú por defecto
      City: 'Desconocida',
      Birthdate: auth0User.birthdate || '2000-01-01',
      CreatedAt: new Date().toISOString()
    };
  }

  private logAuth0UserData(auth0User: Auth0User | null | undefined): void {
    console.group('Auth0 User Data');
    console.log('Complete object:', auth0User);
    if (auth0User) {
      console.log('sub:', auth0User.sub);
      console.log('email:', auth0User.email);
      console.log('name:', auth0User.name);
      console.log('given_name:', auth0User.given_name);
      console.log('family_name:', auth0User.family_name);
      console.log('gender:', auth0User.gender);
      console.log('birthdate:', auth0User.birthdate);
    }
    console.groupEnd();
  }

  private createUser(userData: any): Observable<User> {
    console.log('Sending user data to backend:', userData);
    return this.http.post<User>(this.apiUrl, userData).pipe(
      tap({
        next: (response) => console.log('User created successfully:', response),
        error: (error) => {
          console.error('Error creating user:', error);
          if (error.error) {
            console.log('Error details:', error.error);
          }
        }
      })
    );
  }

  private findUserByEmail(email: string): Observable<User | null> {
    console.log(`Looking for user with email: ${email}`);
    return this.http.post<{ data: User }>(`${this.apiUrl}/find`, { email }).pipe(
      tap({
        next: (response) => console.log('Find user response:', response),
        error: (error) => console.log('Error finding user:', error)
      }),
      map(response => response?.data || null),
      catchError(() => of(null))
    );
  }
}
