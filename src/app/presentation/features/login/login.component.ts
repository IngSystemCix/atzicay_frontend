import { Component, OnInit } from '@angular/core';
import { ModalComponent } from '../../shared/modal/modal.component';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/infrastructure/api/auth.service';
import { filter, switchMap, take, tap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ModalComponent, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  protected showModal: boolean = false;
  protected isLoading: boolean = true;
  public acceptData: boolean = false;

  private hasLoggedIn = false;

  constructor(
    public auth: Auth0Service,
    private router: Router,
    private backendAuthService: AuthService
  ) { }

  /**
   * Al inicializar el componente, si el usuario está autenticado,
   * se obtiene su token de Auth0, se realiza el login en el backend,
   * se guarda el token JWT y se navega al dashboard.
   */
  ngOnInit(): void {
    this.auth.isAuthenticated$.pipe(
      filter(authenticated => authenticated && !this.hasLoggedIn),
      take(1),
      switchMap(() => this.auth.idTokenClaims$),
      filter(claims => !!claims?.__raw),
      take(1),
      switchMap(claims => this.backendAuthService.login(claims!.__raw)),
      tap(authResponse => {
        this.hasLoggedIn = true;
        sessionStorage.setItem('token_jwt', authResponse.access_token);
        sessionStorage.setItem('user', JSON.stringify(authResponse.user));

        // Navegación en el siguiente ciclo del event loop para asegurar persistencia
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 0);
      })
    ).subscribe({
      error: (err) => {
        console.error('Error durante el login:', err);
        this.isLoading = false;
      }
    });
  }

  handleOpenModal = () => { this.showModal = true };
  handleCloseModal = () => { this.showModal = false };

  handleLogin = () => {
    this.auth.loginWithRedirect({
      authorizationParams: {
        connection: 'google-oauth2',
      },
      appState: {
        target: '/dashboard',
      },
    });
  };
}
