import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService as Auth0 } from '@auth0/auth0-angular';
import { AuthService } from '../../../core/infrastructure/api/auth.service';
import { Subscription } from 'rxjs';
import { SidebarService } from '../../../core/infrastructure/api/sidebar/sidebar.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
})
export class SidebarComponent {
  private document = inject(DOCUMENT);
  private auth = inject(Auth0);
  private backendAuth = inject(AuthService);
  private sidebarService = inject(SidebarService);
  private router = inject(Router);

  isCollapsed = false;
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.subscription.add(
      this.sidebarService.isCollapsed$.subscribe((collapsed) => {
        this.isCollapsed = collapsed;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  navigateToInicio(): void {
    this.router.navigate(['/inicio']);
  }

  cerrarSesion() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
    }).then((result) => {
      if (result.isConfirmed) {
        this.backendAuth.logout();

        this.auth.logout({
          logoutParams: { returnTo: this.document.location.origin },
        });
      }
    });
  }
}
