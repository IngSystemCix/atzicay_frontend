import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../api/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = sessionStorage.getItem('token_jwt'); // Usar misma clave que en AppComponent

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el backend responde con 401, intenta refrescar el token
      const oldToken = sessionStorage.getItem('token_jwt'); // misma clave

      if (error.status === 401 && oldToken) {
        return authService.refreshToken(oldToken).pipe(
          switchMap((res: any) => {
            const newToken = res.access_token;
            sessionStorage.setItem('token_jwt', newToken);

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Si falla el refresh, limpia el token y redirige al login
            sessionStorage.removeItem('token_jwt');
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
