import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {catchError, map, Observable, of} from 'rxjs';
import { Hangman } from '../../../domain/model/hangman/hangman';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class HangmanService {

  private apiUrl = environment.api_base_url + 'hangman';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los juegos de Ahorcado
   * @returns Observable con la lista de juegos de Ahorcado
   */
  getAllHangman(professorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/all/${professorId}`).pipe(
      catchError(error => {
        console.error('Error al obtener juegos de hangman:', error);
        return of({ status: 'error', data: [], message: 'Error al cargar juegos' });
      })
    );
  }

  /**
   * Obtiene un juego de Ahorcado por su ID
   * @param id ID del juego de Ahorcado
   * @returns Observable con el juego de Ahorcado
   */
  getHangmanById(id: number): Observable<Hangman> {
    return this.http.get<Hangman>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo juego de Ahorcado
   * @param hangman Datos del juego de Ahorcado a crear
   * @returns Observable con el juego de Ahorcado creado
   */
  createHangman(hangman: Hangman): Observable<Hangman> {
    return this.http.post<Hangman>(this.apiUrl, hangman);
  }

  /**
   * Actualiza un juego de Ahorcado existente
   * @param id ID del juego de Ahorcado a actualizar
   * @param hangman Nuevos datos del juego de Ahorcado
   * @returns Observable con el juego de Ahorcado actualizado
   */
  updateHangman(id: number, hangman: Hangman): Observable<Hangman> {
    return this.http.put<Hangman>(`${this.apiUrl}/${id}`, hangman);
  }

  /**
   * Elimina un juego de Ahorcado
   * @param id ID del juego de Ahorcado a eliminar
   * @returns Observable con la respuesta de la eliminación
   */
  deleteHangman(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
