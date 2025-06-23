import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from "../../shared/modal/modal.component";
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/infrastructure/api/auth.service';
import { filter, switchMap, take, tap } from 'rxjs';

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
  ) {}

  /**
   * Despues de que el componente se haya inicializado, este metodo
   * inicia un proceso de inicio de sesion utilizando el servicio de
   * Auth0. Primero, verifica si el usuario está autenticado. Si es
   * así, obtiene las reclamaciones del usuario y lo inicia sesión
   * utilizando el servicio de backend. Después de que el inicio de
   * sesión sea exitoso, navega a la ruta '/dashboard'. Si hay un
   * error, establece la bandera isLoading en false.
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
        sessionStorage.setItem('token_jwt', authResponse.access_token); // Unificamos la clave del token
        sessionStorage.setItem('user', JSON.stringify(authResponse.user));
        this.router.navigate(['/dashboard']);
      })
    ).subscribe({
      error: () => this.isLoading = false
    });
  }

  handleOpenModal = () => this.showModal = true;
  handleCloseModal = () => this.showModal = false;

  handleLogin = () => {
    this.auth.loginWithRedirect({
      authorizationParams: {
        connection: 'google-oauth2',
      },
      appState: {
        target: '/dashboard',
      },
    });
  }
}
