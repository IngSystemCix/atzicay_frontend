import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, of } from 'rxjs';
import { AuthService } from '../api/auth.service';
import { UserSessionService } from '../service/user-session.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const userSessionService = inject(UserSessionService);
  const token = userSessionService.getToken();

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
      const oldToken = userSessionService.getToken();

      // Solo intentamos refrescar si el token anterior existe y no estamos ya refrescando
      if (is401 && oldToken && !isRefreshing) {
        return authService.refreshToken(oldToken).pipe(
          switchMap((res: any) => {
            const newToken = res.access_token;
            userSessionService.setToken(newToken);

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
            userSessionService.clearSession();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
