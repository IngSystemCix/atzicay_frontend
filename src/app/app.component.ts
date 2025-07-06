import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';
import { filter, switchMap, take, tap } from 'rxjs';
import { AuthService } from './core/infrastructure/api/auth.service';
import { UserSessionService } from './core/infrastructure/service/user-session.service';
import { GlobalLoadingComponent } from './presentation/components/global-loading/global-loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, GlobalLoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private auth0 = inject(Auth0Service);
  private backendAuth = inject(AuthService);
  private router = inject(Router);
  private userSessionService = inject(UserSessionService);
  private hasLoggedIn = false;

  ngOnInit(): void {

    this.auth0.isAuthenticated$.pipe(
      filter(authenticated => authenticated && !this.hasLoggedIn),
      take(1),
      switchMap(() => this.auth0.idTokenClaims$),
      filter((claims): claims is { __raw: string } => !!claims && typeof (claims as any).__raw === 'string'),
      switchMap((claims) => this.backendAuth.login((claims as { __raw: string }).__raw)),
      tap(authResponse => {
        this.hasLoggedIn = true;
        // Usar UserSessionService para manejar el token centralmente
        this.userSessionService.setToken(authResponse.access_token);
        sessionStorage.setItem('user', JSON.stringify(authResponse.user));

        if (location.pathname === '/') {
          this.router.navigate(['/dashboard']);
        }
      })
    ).subscribe({
      error: (err) => {
        console.error('[AppComponent] Error autenticando:', err);
      }
    });
  }
}
