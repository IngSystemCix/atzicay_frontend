import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const loginGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('token_jwt');

  if (token) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
