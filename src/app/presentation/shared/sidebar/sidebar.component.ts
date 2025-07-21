import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService as Auth0 } from '@auth0/auth0-angular';
import { AuthService } from '../../../core/infrastructure/api/auth.service';
import { Subscription } from 'rxjs';
import { SidebarService } from '../../../core/infrastructure/api/sidebar/sidebar.service';
import Swal from 'sweetalert2';
import { CreditsModalComponent } from '../../components/credits-modal/credits-modal.component';
import { CreditsModalService } from '../../../core/infrastructure/service/credits-modal.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, CreditsModalComponent],
})
export class SidebarComponent {
  private document = inject(DOCUMENT);
  private auth = inject(Auth0);
  private backendAuth = inject(AuthService);
  private sidebarService = inject(SidebarService);
  showCreditsModal = false;

  isCollapsed = false;
  private subscription: Subscription = new Subscription();
  constructor(private creditsModalService: CreditsModalService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.sidebarService.isCollapsed$.subscribe((collapsed) => {
        this.isCollapsed = collapsed;
      })
    );
  }

  openCreditsModal() {
    this.creditsModalService.open();
  }

  closeCreditsModal() {
    this.showCreditsModal = false;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
