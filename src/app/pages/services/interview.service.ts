import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Interview } from '../models/interview.model';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private apiUrl = 'http://localhost:8085/ElitGo/Interview';

  constructor(private http: HttpClient) { }

  getAllInterviews(): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.apiUrl}/retrieve-all-interviews`);
  }

  addInterview(interview: Interview): Observable<Interview> {
    return this.http.post<Interview>(`${this.apiUrl}/add-interview`, interview);
  }

  deleteInterview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/remove-interview/${id}`);
  }

  updateInterview(interview: Interview): Observable<Interview> {
    return this.http.put<Interview>(`${this.apiUrl}/modify-interview`, interview);
  }
}
