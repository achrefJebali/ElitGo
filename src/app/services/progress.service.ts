import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Progress } from '../models/progress';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiUrl = 'http://localhost:8085/ElitGo/Formation';

  constructor(private http: HttpClient) { }

  getProgress(userId: number, formationId: number): Observable<Progress> {
    return this.http.get<any>(`${this.apiUrl}/progress/${userId}/${formationId}`).pipe(
      map(response => {
        // Ensure the response matches the Progress interface
        const progress: Progress = {
          id: response.id,
          progressPercentage: response.progressPercentage ?? 0,
          videosCompleted: response.videosCompleted ?? false,
          quizScore: response.quizScore,
          lastUpdated: response.lastUpdated,
          user: response.user, // Now matches the Progress interface
          formation: response.formation // Now matches the Progress interface
        };
        return progress;
      }),
      catchError(this.handleError)
    );
  }

  updateProgress(userId: number, formationId: number, progress: Progress): Observable<Progress> {
    return this.http.post<Progress>(`${this.apiUrl}/progress/${userId}/${formationId}`, progress).pipe(
      catchError(this.handleError)
    );
  }

  markVideoWatched(userId: number, formationId: number, videoId: number) {
    return this.http.post(`${this.apiUrl}/progress/${userId}/${formationId}/video-watched/${videoId}`, {});
  }

  getWatchedVideos(userId: number, formationId: number) {
    return this.http.get<number[]>(`${this.apiUrl}/progress/${userId}/${formationId}/watched-videos`);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Backend error: Status ${error.status}, Message: ${error.message}`;
    }
    // Use errorMessage variable for user feedback if needed
    return throwError(() => new Error(errorMessage));
  }
}