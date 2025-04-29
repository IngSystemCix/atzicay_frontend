import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from "../../shared/modal/modal.component";
import { AuthService } from '@auth0/auth0-angular';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,ModalComponent, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  protected showModal: boolean = false;
  protected isLoading: boolean = true;

  constructor(
    public auth: AuthService,
    private router: Router
  ) {
    this.auth.isAuthenticated$.subscribe((authenticated) => {
      if (authenticated) {
        this.router.navigate(['/dashboard']);
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
        target: '/dashboard'
      },
    });
  }
}


