import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile } from '../../../core/domain/model/profile.model';
import { environment } from '../../../../environments/environment.development';

interface ProfileResponse {
  success: boolean;
  message: string;
  data: Profile;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = environment.api_base_url;

  constructor(private http: HttpClient) {}

  getUserProfile(userId: number): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(
      `${this.apiUrl}user/profile/${userId}`
    );
  }

  updateUserProfile(userId: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}user/update/${userId}`, payload);
  }
  getUserIdByEmail(
    email: string
  ): Observable<{
    success: boolean;
    code: number;
    message: string;
    data: { user_id: number };
  }> {
    return this.http.post<{
      success: boolean;
      code: number;
      message: string;
      data: { user_id: number };
    }>(`${this.apiUrl}user/id-by-email`, { email });
  }

  // Método para obtener el country_id por nombre de país
  getCountryIdByName(countryName: string, countries: any[]): number | null {
    const country = countries.find(c => c.Name === countryName);
    return country ? country.Id : null;
  }
}
