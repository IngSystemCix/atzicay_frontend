import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'atzicay';
  sidebarCollapsed = false;

  constructor(public auth: Auth0Service, private router: Router) {}

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  ngOnInit(): void {
    this.auth.appState$.subscribe((appState) => {
      if (appState?.target) {
        this.router.navigate([appState.target]);
      }
    });
  }
}
