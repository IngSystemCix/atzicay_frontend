import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Country } from '../../../core/domain/model/country.model';
import { environment } from '../../../../environments/environment.development';

interface CountryResponse {
  success: boolean;
  data: Country[];
  message: string;
}

@Injectable({ providedIn: 'root' })
export class CountryService {
  private apiUrl = environment.api_base_url;

  constructor(private http: HttpClient) {}

  getAllCountries(): Observable<CountryResponse> {
    return this.http.get<CountryResponse>(`${this.apiUrl}country/all`);
  }
}
