import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface GameUrlToken {
  token: string;
  expiresAt: Date;
  gameInstanceId: number;
  userId: number;
}

export interface GameUrlResponse {
  success: boolean;
  data: {
    token: string;
    url: string;
    expires_at: string;
  };
  message: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  gameInstanceId?: number;
  userId?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameUrlService {
  private readonly apiUrl: string;

  constructor(private http: HttpClient) {
    // Eliminar la barra final si existe para evitar dobles barras
    this.apiUrl = environment.api_base_url.replace(/\/$/, '');
  }

  /**
   * Genera un token seguro para acceso al juego
   */
  generateSecureGameToken(gameInstanceId: number, userId: number): Observable<GameUrlResponse> {
    const url = `${this.apiUrl}/game/generate-token`;
    const body = {
      game_instance_id: gameInstanceId,
      user_id: userId
    };

    console.log('🔗 Generando token seguro:', {
      url,
      gameInstanceId,
      userId,
      baseUrl: this.apiUrl
    });

    // Temporal: Devolver respuesta simulada hasta que el backend esté listo
    const mockResponse: GameUrlResponse = {
      success: true,
      data: {
        token: this.generateMockToken(gameInstanceId, userId),
        url: '',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      },
      message: 'Token generado exitosamente (modo simulación)'
    };

    return of(mockResponse);

    // Cuando el backend esté listo, descomenta esta línea:
    // return this.http.post<GameUrlResponse>(url, body);
  }

  /**
   * Valida un token de acceso al juego
   */
  validateGameToken(token: string): Observable<TokenValidationResponse> {
    const url = `${this.apiUrl}/game/validate-token`;
    
    console.log('🔐 Validando token:', {
      url,
      token: token.substring(0, 20) + '...'
    });

    // Temporal: Validación simulada
    const decoded = this.decodeMockToken(token);
    const mockResponse: TokenValidationResponse = {
      valid: decoded !== null,
      gameInstanceId: decoded?.gameInstanceId,
      userId: decoded?.userId,
      message: decoded ? 'Token válido (simulación)' : 'Token inválido (simulación)'
    };

    return of(mockResponse);

    // Cuando el backend esté listo, descomenta esta línea:
    // return this.http.post<TokenValidationResponse>(url, { token });
  }

  /**
   * Genera una URL limpia y segura para el juego
   */
  generateCleanGameUrl(gameType: string, token: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/play/${gameType}/${token}`;
  }

  /**
   * Mapea el tipo de juego a la ruta correspondiente
   */
  mapGameTypeToRoute(gameType: string): string {
    const normalizedType = gameType.toLowerCase().replace(/[\s_-]/g, '');
    
    const gameRoutes: { [key: string]: string } = {
      'ahorcado': 'hangman',
      'hangman': 'hangman',
      'rompecabezas': 'puzzle',
      'puzzle': 'puzzle',
      'memoria': 'memory',
      'memory': 'memory',
      'pupiletras': 'solve-the-word',
      'solvetheword': 'solve-the-word',
      'sopadepalabras': 'solve-the-word'
    };

    const mappedType = gameRoutes[normalizedType];
    
    if (!mappedType) {
      console.warn('⚠️ Tipo de juego no reconocido:', gameType);
      return 'unknown';
    }

    return mappedType;
  }

  /**
   * Método temporal para generar tokens simulados
   */
  private generateMockToken(gameInstanceId: number, userId: number): string {
    const payload = {
      gameInstanceId,
      userId,
      timestamp: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
    };
    
    // Simple encoding (NO usar en producción)
    return btoa(JSON.stringify(payload)).replace(/[+/=]/g, '');
  }

  /**
   * Método temporal para decodificar tokens simulados
   */
  private decodeMockToken(token: string): { gameInstanceId: number, userId: number } | null {
    try {
      // Restaurar caracteres base64
      let base64 = token;
      while (base64.length % 4) {
        base64 += '=';
      }
      
      const payload = JSON.parse(atob(base64));
      
      // Verificar si el token ha expirado
      if (payload.expires < Date.now()) {
        console.warn('⚠️ Token simulado expirado');
        return null;
      }
      
      return {
        gameInstanceId: payload.gameInstanceId,
        userId: payload.userId
      };
    } catch (error) {
      console.error('❌ Error decodificando token simulado:', error);
      return null;
    }
  }
}