import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { UserSessionService } from '../service/user-session.service';
import { map, switchMap, timeout, catchError, of } from 'rxjs';

export const optimizedAuthGuard: CanActivateFn = (route, state) => {
  const auth0 = inject(AuthService);
  const userSessionService = inject(UserSessionService);
  const router = inject(Router);

  if (userSessionService.isAuthenticated()) {
    return true;
  }


  return auth0.isAuthenticated$.pipe(
    switchMap(isAuth0Authenticated => {
      if (!isAuth0Authenticated) {
        router.navigate(['/login']);
        return of(false);
      }

      // Si está autenticado en Auth0 pero no tenemos token interno, esperar un poco
      return userSessionService.waitForToken$(3000).pipe(
        map(token => {
          return true;
        }),
        catchError(err => {
          console.warn('[OptimizedAuthGuard] Timeout esperando token interno, permitiendo acceso de todas formas');
          return of(true);
        })
      );
    })
  );
};
