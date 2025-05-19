import { DOCUMENT } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService as Auth0 } from '@auth0/auth0-angular';
import { AuthService } from '../../../core/infrastructure/api/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
})
export class SidebarComponent {
  private document = inject(DOCUMENT);
  private auth = inject(Auth0);
  private backendAuth = inject(AuthService);

  cerrarSesion() {
    this.backendAuth.logout().subscribe({
      next: () => {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user');
        this.auth.logout({
          logoutParams: { returnTo: this.document.location.origin },
        });
      },
      error: (err) => {
        console.error('Error al cerrar sesión en el backend', err);
        // Aún así cerramos sesión en Auth0
        this.auth.logout({
          logoutParams: { returnTo: this.document.location.origin },
        });
      },
    });
  }
}
