import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from "../../shared/modal/modal.component";
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/infrastructure/api/auth.service';
import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ModalComponent, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  protected showModal: boolean = false;
  protected isLoading: boolean = true;
  public acceptData: boolean = false;

  constructor(
    public auth: Auth0Service,
    private router: Router,
    private backendAuthService: AuthService
  ) {
    this.auth.isAuthenticated$.subscribe((authenticated) => {
      if (authenticated) {
        this.auth.idTokenClaims$.pipe(
          filter(claims => !!claims?.__raw),
          switchMap(claims => {
            const idToken = claims!.__raw;
            return this.backendAuthService.login(idToken);
          })
        ).subscribe({
          next: (authResponse) => {
            sessionStorage.setItem('access_token', authResponse.access_token);
            sessionStorage.setItem('user', JSON.stringify(authResponse.user));
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.isLoading = false;
          }
        });
      } else {
        this.isLoading = false;
      }
    });
  }

  handleOpenModal = () => {
    this.showModal = true;
  }

  handleCloseModal = () => {
    this.showModal = false;
  }

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
