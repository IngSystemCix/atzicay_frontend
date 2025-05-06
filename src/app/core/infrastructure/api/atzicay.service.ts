import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AtzicayService {

  private baseURL: string = 'http://localhost:8000/api/atzicay/v1';
  constructor(private http:HttpClient) { }

  getAllGameInstances():Observable<any[]>{
    return this.http.get<any[]>(`${this.baseURL}/game-instances`);
  }
}
