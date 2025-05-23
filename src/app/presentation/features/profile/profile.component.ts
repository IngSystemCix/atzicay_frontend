import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import {CommonModule} from '@angular/common';
import { RouterModule } from '@angular/router';
import {ModalEditUsersComponent} from '../../shared/modal-edit-users/modal-edit-users.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalEditUsersComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  user: any = {}; // Objeto para almacenar los datos del usuario

  constructor(public auth: AuthService) {
    this.auth.user$.subscribe((user) => {
      this.user = user;
      console.log(user);
    });
  }

  showModal = false;

  abrirModal() {
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }
}
