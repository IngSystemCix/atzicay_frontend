import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAuth0 } from '@auth0/auth0-angular';
import { routes } from './app.routes';
import { environment } from '../environments/environment.development';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/infrastructure/middleware/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    provideAuth0({
      domain: environment.domain,
      clientId: environment.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin + '/dashboard',
        response_type: 'id_token',
        scope: 'openid profile email',
      },
    }),
    provideHttpClient(
      withInterceptors([authInterceptor]),
    ),
  ]
};
