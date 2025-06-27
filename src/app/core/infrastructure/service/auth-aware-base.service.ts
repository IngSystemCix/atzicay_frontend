import { Injectable, inject, OnDestroy } from '@angular/core';
import { Subscription, Observable, of } from 'rxjs';
import { UserSessionService } from './user-session.service';

/**
 * Servicio base para componentes que necesitan autenticación.
 * Proporciona métodos comunes para esperar tokens y usuarios.
 */
@Injectable()
export abstract class AuthAwareBaseService implements OnDestroy {
  protected userSessionService = inject(UserSessionService);
  protected subscription = new Subscription();
  protected isInitialized = false;

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Espera a que tanto el token como el userId estén disponibles
   * @param timeoutMs Tiempo máximo de espera en milisegundos
   * @returns Promise que se resuelve cuando ambos están disponibles
   */
  protected waitForAuth(timeoutMs = 5000): Promise<{ token: string; userId: number }> {
    return new Promise((resolve, reject) => {
      const token = this.userSessionService.getToken();
      const userId = this.userSessionService.getUserId();

      // Si ya tenemos ambos, resolver inmediatamente
      if (token && userId) {
        return resolve({ token, userId });
      }

      let hasToken = !!token;
      let hasUserId = !!userId;
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error('Timeout esperando autenticación completa'));
        }
      }, timeoutMs);

      const checkAndResolve = () => {
        if (hasToken && hasUserId && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          const currentToken = this.userSessionService.getToken();
          const currentUserId = this.userSessionService.getUserId();
          if (currentToken && currentUserId) {
            resolve({ token: currentToken, userId: currentUserId });
          } else {
            reject(new Error('Token o userId no disponibles después de la espera'));
          }
        }
      };

      // Esperar token si no lo tenemos
      if (!hasToken) {
        this.subscription.add(
          this.userSessionService.waitForToken$(timeoutMs).subscribe({
            next: (receivedToken) => {
              console.log('[AuthAwareBase] Token recibido');
              hasToken = true;
              checkAndResolve();
            },
            error: (err) => {
              if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                reject(err);
              }
            }
          })
        );
      }

      // Esperar userId si no lo tenemos
      if (!hasUserId) {
        this.subscription.add(
          this.userSessionService.userId$.subscribe(receivedUserId => {
            if (receivedUserId) {
              console.log('[AuthAwareBase] UserId recibido:', receivedUserId);
              hasUserId = true;
              checkAndResolve();
            }
          })
        );
      }
    });
  }

  /**
   * Versión Observable de waitForAuth
   */
  protected waitForAuth$(): Observable<{ token: string; userId: number }> {
    return new Observable(subscriber => {
      this.waitForAuth()
        .then(auth => {
          subscriber.next(auth);
          subscriber.complete();
        })
        .catch(err => {
          subscriber.error(err);
        });
    });
  }

  /**
   * Verifica si el componente puede proceder (tiene token y userId)
   */
  protected canProceed(): boolean {
    return !!(this.userSessionService.getToken() && this.userSessionService.getUserId());
  }

  /**
   * Inicializa el componente esperando autenticación si es necesario
   */
  protected async initializeWithAuth(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      if (this.canProceed()) {
        console.log('[AuthAwareBase] Autenticación ya disponible');
        this.isInitialized = true;
        await this.onAuthReady();
      } else {
        console.log('[AuthAwareBase] Esperando autenticación...');
        await this.waitForAuth();
        this.isInitialized = true;
        await this.onAuthReady();
      }
    } catch (error) {
      console.error('[AuthAwareBase] Error en inicialización:', error);
      this.onAuthError(error);
    }
  }

  /**
   * Método abstracto que deben implementar las clases hijas
   * Se llama cuando la autenticación está lista
   */
  protected abstract onAuthReady(): Promise<void> | void;

  /**
   * Método que pueden sobrescribir las clases hijas para manejar errores de auth
   */
  protected onAuthError(error: any): void {
    console.error('Error de autenticación:', error);
  }
}
