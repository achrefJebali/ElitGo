import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Review } from '../models/review';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  addReview(userId: number, formationId: number, review: Review): Observable<Review> {
    // Updated endpoint to match backend: /api/reviews/add/{userId}/{formationId}
    return this.http.post<Review>(`${this.apiUrl}/api/reviews/add/${userId}/${formationId}`, review);
  }
}
