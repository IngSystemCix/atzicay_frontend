import { OnInit, OnDestroy, inject, Directive } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserSessionService } from '../../infrastructure/service/user-session.service';

/**
 * Componente base para componentes que requieren autenticación.
 * Proporciona funcionalidad común para esperar el token y manejar errores de autenticación.
 */
@Directive()
export abstract class BaseAuthenticatedComponent implements OnInit, OnDestroy {
  protected userSessionService = inject(UserSessionService);
  protected subscription = new Subscription();
  public isLoading = false;
  public authError = '';

  ngOnInit(): void {
    this.initializeAuthentication();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Inicializa la autenticación y llama a onAuthenticationReady cuando está lista
   */
  protected initializeAuthentication(): void {
    if (this.userSessionService.isAuthenticated()) {
      const userId = this.userSessionService.getUserId();
      if (userId) {
        this.onAuthenticationReady(userId);
      } else {
        this.onAuthenticationError('Usuario no encontrado');
      }
    } else {
      this.isLoading = true;
      this.subscription.add(
        this.userSessionService.waitForToken$(5000).subscribe({
          next: () => {
            const userId = this.userSessionService.getUserId();
            if (userId) {
              this.isLoading = false;
              this.onAuthenticationReady(userId);
            } else {
              this.onAuthenticationError('Usuario no encontrado después de la autenticación');
            }
          },
          error: (err) => {
            this.isLoading = false;
            console.error(`[${this.getComponentName()}] Error esperando token:`, err);
            this.onAuthenticationError('Error de autenticación. Por favor, recarga la página.');
          }
        })
      );
    }
  }

  /**
   * Método abstracto que debe implementar cada componente hijo.
   * Se llama cuando la autenticación está lista y se tiene el userId.
   */
  protected abstract onAuthenticationReady(userId: number): void;

  /**
   * Método que se llama cuando hay un error de autenticación.
   * Puede ser sobrescrito por los componentes hijos.
   */
  protected onAuthenticationError(error: string): void {
    this.authError = error;
    this.isLoading = false;
  }

  /**
   * Obtiene el nombre del componente para logging.
   * Puede ser sobrescrito por los componentes hijos.
   */
  protected getComponentName(): string {
    return this.constructor.name;
  }

  /**
   * Método de utilidad para verificar si el usuario está autenticado
   */
  public get isAuthenticated(): boolean {
    return this.userSessionService.isAuthenticated();
  }

  /**
   * Método de utilidad para obtener el token actual
   */
  public get currentToken(): string | null {
    return this.userSessionService.getToken();
  }

  /**
   * Método de utilidad para obtener el userId actual
   */
  public get currentUserId(): number | null {
    return this.userSessionService.getUserId();
  }
}
