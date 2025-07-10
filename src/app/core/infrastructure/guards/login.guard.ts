import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RedirectService } from '../service/RedirectService.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('token_jwt');
  const redirectService = inject(RedirectService);

  console.log('[LoginGuard] Token existe:', !!token);
  console.log('[LoginGuard] Return URL en sessionStorage:', sessionStorage.getItem('returnUrl'));

  if (token) {
    // Usar el servicio para manejar la redirección
    redirectService.redirectAfterLogin();
    return false;
  }

  // Si viene de una URL protegida, guardar la URL para después del login
  if (state && state.url && !state.url.startsWith('/login')) {
    redirectService.setReturnUrl(state.url);
  }

  return true;
};