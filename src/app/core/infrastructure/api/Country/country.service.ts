import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Country } from '../../../domain/model/country/country';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  private apiUrl = 'http://127.0.0.1:8000/api/atzicay/v1/countries';

  constructor(private http: HttpClient) { }

  getAllCountries(): Observable<Country[]> {
    return this.http.get<{ data: Country[] }>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getCountryById(id: number): Observable<Country> {
    return this.http.get<Country>(`${this.apiUrl}/${id}`);
  }

  createCountry(country: Country): Observable<Country> {
    return this.http.post<Country>(this.apiUrl, country);
  }

  updateCountry(id: number, country: Country): Observable<Country> {
    return this.http.put<Country>(`${this.apiUrl}/${id}`, country);
  }

  deleteCountry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
