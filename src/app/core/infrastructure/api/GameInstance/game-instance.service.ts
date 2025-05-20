import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { GameInstance } from '../../../domain/model/gameInstance/game-instance';

@Injectable({
  providedIn: 'root'
})
export class GameInstanceService {

  private apiUrl = 'http://127.0.0.1:8000/api/atzicay/v1/game-instances';

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
  getAllGameInstances(): Observable<GameInstance[]> {
    return this.http.get<{ data: GameInstance[] }>(this.apiUrl).pipe(
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
}
