import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  constructor(@Inject(DOCUMENT) public document: Document, public auth: AuthService) {}

  cerrarSesion() {
    this.auth.logout({logoutParams:{returnTo: this.document.location.origin}});
  }
}
