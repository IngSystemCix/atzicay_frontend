import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {map, Observable} from 'rxjs';
import { Hangman } from '../../../domain/model/hangman/hangman';

@Injectable({
  providedIn: 'root'
})
export class HangmanService {

  private apiUrl = 'http://127.0.0.1:8000/api/atzicay/v1/hangman';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los juegos de Ahorcado
   * @returns Observable con la lista de juegos de Ahorcado
   */
  getAllHangman(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
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
