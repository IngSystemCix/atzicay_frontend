import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, of } from 'rxjs';
import { AuthService } from '../api/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = sessionStorage.getItem('token_jwt');

  // Evitar incluir token en la solicitud de refresh-token para no entrar en bucle
  const isRefreshing = req.url.includes('/auth/refresh-token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token && !isRefreshing) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const authReq = req.clone({ setHeaders: headers });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const is401 = error.status === 401;
      const oldToken = sessionStorage.getItem('token_jwt');

      // Solo intentamos refrescar si el token anterior existe y no estamos ya refrescando
      if (is401 && oldToken && !isRefreshing) {
        return authService.refreshToken(oldToken).pipe(
          switchMap((res: any) => {
            const newToken = res.access_token;
            sessionStorage.setItem('token_jwt', newToken);

            // Reenviamos la solicitud original con el nuevo token
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
                'Content-Type': 'application/json',
              },
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            sessionStorage.removeItem('token_jwt');
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
