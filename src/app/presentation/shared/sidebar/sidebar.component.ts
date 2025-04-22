import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  constructor(private router: Router) {}

  cerrarSesion() {
    // Implement logout logic here
    this.router.navigate(['/login']);
  }
}
