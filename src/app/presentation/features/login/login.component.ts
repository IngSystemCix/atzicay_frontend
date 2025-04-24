import { Component } from '@angular/core';
import { ModalComponent } from "../../shared/modal/modal.component";
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-login',
  imports: [ModalComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  protected showModal: boolean = false;
  constructor(public auth: AuthService) {}
  handleOpenModal = () => {
    this.showModal = true;
  }
  handleCloseModal = () => {
    this.showModal = false;
  }
  handleLogin = () => {
    this.auth.loginWithRedirect({
      appState: {
        target: '/dashboard'
      }
    });
  }
}


