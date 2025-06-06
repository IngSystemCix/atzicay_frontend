import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {Assessment} from '../../../domain/model/assessent/assessment';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {

  private apiUrl = environment.api_base_url + 'assessments';

  constructor(private http: HttpClient) { }

  getAllAssessments(): Observable<Assessment[]> {
    return this.http.get<{ data: Assessment[] }>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getAssessmentsById(id: number): Observable<Assessment> {
    return this.http.get<Assessment>(`${this.apiUrl}/${id}`);
  }

  createAssessment(assessment: Assessment): Observable<Assessment> {
    return this.http.post<Assessment>(this.apiUrl, assessment);
  }

  updateAssessment(id: number, assessment: Assessment): Observable<Assessment> {
    return this.http.put<Assessment>(`${this.apiUrl}/${id}`, assessment);
  }

  deleteAssessment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
