import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feedback } from '../models/feedback'; // Assure-toi que le chemin est correct

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

   private apiUrl = 'http://localhost:8085/ElitGo/feedbacks';

  constructor(private http: HttpClient) { }

getFeedbacks(): Observable<Feedback[]> {
  return this.http.get<Feedback[]>(`${this.apiUrl}/retrieve-all`);
}

addFeedback(feedback: Feedback): Observable<Feedback> {
  return this.http.post<Feedback>(`${this.apiUrl}/add`, feedback);
}

deleteFeedback(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/remove/${id}`);
}

  updateFeedback(feedback: Feedback): Observable<Feedback> {
    return this.http.put<Feedback>(`${this.apiUrl}/${feedback.id}`, feedback);
  }

}
