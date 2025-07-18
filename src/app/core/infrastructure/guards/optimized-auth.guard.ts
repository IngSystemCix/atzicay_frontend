import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { UserSessionService } from '../service/user-session.service';
import { GameLoadingService } from '../service/game-loading.service';
import { map, switchMap, timeout, catchError, of, tap } from 'rxjs';
import { RedirectService } from '../service/RedirectService.service';

export const optimizedAuthGuard: CanActivateFn = (route, state) => {
  const auth0 = inject(AuthService);
  const userSessionService = inject(UserSessionService);
  const router = inject(Router);
  const gameLoadingService = inject(GameLoadingService);
  const redirectService = inject(RedirectService);

  console.log('[OptimizedAuthGuard] URL actual:', state.url);
  console.log('[OptimizedAuthGuard] Está autenticado:', userSessionService.isAuthenticated());

  // Guardar URL de retorno si es necesario
  redirectService.setReturnUrl(state.url);

  // Si ya está autenticado, permitir acceso inmediato
  if (userSessionService.isAuthenticated()) {
    return true;
  }

  // Mostrar loading súper rápido para autenticación
  gameLoadingService.showFastAuth();

  return auth0.isAuthenticated$.pipe(
    switchMap(isAuth0Authenticated => {
      if (!isAuth0Authenticated) {
        gameLoadingService.hideFast();
        router.navigate(['/login']);
        return of(false);
      }

      // Si está autenticado en Auth0 pero no tenemos token interno, esperar un poco
      // gameLoadingService.updateMessage('Sincronizando sesión...');
      
      return userSessionService.waitForToken$(1000).pipe( // Reducido a 1 segundo
        map(token => {
          gameLoadingService.hideFast();
          return true;
        }),
        catchError(err => {
          console.warn('[OptimizedAuthGuard] Timeout esperando token interno, permitiendo acceso de todas formas');
          gameLoadingService.hideFast();
          return of(true);
        })
      );
    }),
    // Timeout general más agresivo
    timeout(1500),
    catchError(error => {
      console.error('[OptimizedAuthGuard] Error en autenticación:', error);
      gameLoadingService.hideFast();
      router.navigate(['/login']);
      return of(false);
    })
  );
};