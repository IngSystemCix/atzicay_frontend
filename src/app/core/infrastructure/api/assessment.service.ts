import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AverageAssessmentResponse } from '../../domain/model/average-assessment.model';
import { environment } from '../../../../environments/environment.development';
import { UserSessionService } from '../service/user-session.service';

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private apiUrl = environment.api_base_url + 'assessments/average';

  constructor(
    private http: HttpClient,
    private userSession: UserSessionService
  ) {}

  getAverageAssessment(): Observable<number> {
    const userId = this.userSession.getUserId();
    if (!userId) return new Observable<number>(observer => observer.next(0));
    return this.http.get<AverageAssessmentResponse>(`${this.apiUrl}/${userId}`).pipe(
      map(res => res.data.average_assessment)
    );
  }
}
