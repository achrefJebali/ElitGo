import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = 'http://localhost:5000/recommend';

  constructor(private http: HttpClient) { }

  getRecommendation(studentData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, studentData);
  }
}