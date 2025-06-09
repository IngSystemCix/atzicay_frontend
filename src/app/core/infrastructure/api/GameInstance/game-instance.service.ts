import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { GameInstance } from '../../../domain/model/gameInstance/game-instance';
import { environment } from '../../../../../environments/environment.development';
import { GameType } from '../../../domain/enum/game-type';
import { GameCountResponse, GameCounts } from '../../../domain/interface/game-count-response';


@Injectable({
  providedIn: 'root'
})
export class GameInstanceService {

  private apiUrl = environment.api_base_url + 'game-instances';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los juegos de instancias
   * @returns Observable con la lista de juegos de instancias
   * Los juegos de instancias vienen con los siguientes atributos:
   * - Id: number
   * - Name: string
   * - Description: string
   * - ProfessorId: number
   * - Activated: boolean
   * - Difficulty: 'E' | 'M' | 'D'
   * - Visibility: "P" | "R" (Private (R) or public (P))
   */
  getAllGameInstances(idProfessor: string, gameType?: string): Observable<GameInstance[]> {
    let url = `${this.apiUrl}/personal/${idProfessor}`;
    
    // Agregar el parámetro gameType si se proporciona
    if (gameType && gameType !== 'all') {
      url += `?gameType=${gameType}`;
    }
    
    return this.http
      .get<{ data: GameInstance[] }>(url)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Obtiene todos los juegos de instancias, incluyendo la informaci n del juego al que pertenecen
   * @returns Observable con la lista de juegos de instancias
   */
  getAllGames(): Observable<GameInstance[]> {
    return this.http.get<{ data: GameInstance[] }>(`${this.apiUrl}/all`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene una instancia de juego por su ID
   * @param id ID de la instancia de juego a obtener
   * @returns Observable con la instancia de juego obtenida
   */
  getGameInstanceById(id: number): Observable<GameInstance> {
    return this.http.get<GameInstance>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva instancia de juego
   * @param gameInstance Instancia de juego a crear
   * @returns Observable con la instancia de juego creada
   */
  createGameInstance(gameInstance: GameInstance): Observable<GameInstance> {
    return this.http.post<GameInstance>(this.apiUrl, gameInstance);
  }

  /**
   * Actualiza una instancia de juego existente
   * @param id ID de la instancia de juego a actualizar
   * @param gameInstance Nuevos valores para la instancia de juego
   * @returns Observable con la instancia de juego actualizada
   */
  updateGameInstance(id: number, gameInstance: GameInstance): Observable<GameInstance> {
    return this.http.put<GameInstance>(`${this.apiUrl}/${id}`, gameInstance);
  }

  /**
   * Elimina una instancia de juego
   * @param id ID de la instancia de juego a eliminar
   * @returns Observable con la respuesta de la eliminaci n
   */
  deleteGameInstance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
 * Obtiene el conteo de juegos por tipo para un profesor específico
 * @param idProfessor ID del profesor
 * @returns Observable con el conteo de juegos por tipo
 */
  getGameCountsByProfessor(idProfessor: number): Observable<GameCounts> {
    return this.http
      .get<GameCountResponse>(`${this.apiUrl}/personal/count/${idProfessor}`)
      .pipe(
        map(response => response.data)
      );
  }
}
