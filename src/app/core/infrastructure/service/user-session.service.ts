import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, take, timeout, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserSessionService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private userIdSubject = new BehaviorSubject<number | null>(null);
  
  public token$ = this.tokenSubject.asObservable();
  public userId$ = this.userIdSubject.asObservable();

  constructor() {
    const existingToken = sessionStorage.getItem('token_jwt');
    const existingUserId = sessionStorage.getItem('user_id');
    
    if (existingToken) {
      this.tokenSubject.next(existingToken);
    }
    
    if (existingUserId) {
      const userId = parseInt(existingUserId, 10);
      if (!isNaN(userId)) {
        this.userIdSubject.next(userId);
      }
    }
  }

  getUserId(): number | null {
    return this.userIdSubject.value;
  }

  setUserId(id: number): void {
    sessionStorage.setItem('user_id', id.toString());
    this.userIdSubject.next(id);
  }

  clearUserId(): void {
    sessionStorage.removeItem('user_id');
    this.userIdSubject.next(null);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  setToken(token: string): void {
    sessionStorage.setItem('token_jwt', token);
    this.tokenSubject.next(token);
  }

  clearToken(): void {
    sessionStorage.removeItem('token_jwt');
    this.tokenSubject.next(null);
  }

  /**
   * Espera a que el token esté disponible usando Observable (más eficiente)
   * @param timeoutMs Tiempo máximo de espera en milisegundos (default: 2000)
   * @returns Observable que emite el token cuando está disponible
   */
  waitForToken$(timeoutMs = 2000): Observable<string> {
    // Si ya tenemos el token, devolverlo inmediatamente
    if (this.tokenSubject.value) {
      return of(this.tokenSubject.value);
    }

    return this.token$.pipe(
      filter(token => token !== null), // Solo continuar cuando el token no sea null
      take(1), // Tomar solo el primer valor válido
      timeout(timeoutMs), // Timeout después de timeoutMs (reducido a 2s)
      catchError(err => {
        console.warn('Timeout esperando token JWT (proceeding anyway):', err);
        // En lugar de fallar, devolver un string vacío para permitir continuar
        return of('');
      })
    ) as Observable<string>;
  }

  /**
   * Versión Promise del waitForToken para compatibilidad
   * @param maxRetries Número máximo de reintentos (reducido)
   * @param interval Intervalo entre reintentos en ms (reducido)
   */
  waitForToken(maxRetries = 20, interval = 50): Promise<string> {
    return new Promise((resolve, reject) => {
      // Si ya tenemos el token, resolverlo inmediatamente
      if (this.tokenSubject.value) {
        return resolve(this.tokenSubject.value);
      }

      let retries = 0;
      const check = () => {
        const token = this.tokenSubject.value;
        if (token) return resolve(token);
        retries++;
        if (retries >= maxRetries) {
          console.warn('Token JWT no disponible después de ' + maxRetries + ' intentos, continuando...');
          return resolve(''); // Resolver con string vacío en lugar de rechazar
        }
        setTimeout(check, interval);
      };
      check();
    });
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  /**
   * Limpia toda la sesión del usuario
   */
  clearSession(): void {
    this.clearToken();
    this.clearUserId();
  }
}
