import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { ModalComponent } from '../../shared/modal/modal.component';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ModalComponent, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  protected showModal = false;
  protected isLoading = signal(false);
  protected accessToken = signal<string>('');

  private auth0 = inject(Auth0Service);

  handleOpenModal = () => {
    this.showModal = true;
  };

  handleCloseModal = () => {
    this.showModal = false;
  };

  handleLogin = () => {
    this.isLoading.set(true);

    this.auth0.loginWithRedirect({
      authorizationParams: {
        connection: 'google-oauth2',
        audience: environment.audience,
        scope: 'openid profile email',
      },
      appState: { target: '/dashboard' },
    });
  };
}
