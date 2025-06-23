import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Country } from '../../domain/interface/countries';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  private apiUrl = `${environment.api_base_url}countries`;

  constructor(private http: HttpClient) {}

  getAllCountries(): Observable<Country[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response) => response.data) 
    );
  }
}
