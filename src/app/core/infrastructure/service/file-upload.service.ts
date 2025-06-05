import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private baseUrl = environment.api_base_url;

  constructor(private http: HttpClient) {}

  uploadImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}upload-puzzle-image`, formData);
  }

  uploadToAssets(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}upload-to-assets`, formData);
  }
}