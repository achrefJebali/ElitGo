import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface PredictionResponse {
  prediction: number;
  probability: number[];
}

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private apiUrl = 'http://localhost:5000/predict';

  constructor(private http: HttpClient) { }

  predict(data: any): Observable<PredictionResponse> {
    console.log('Sending data:', JSON.stringify(data, null, 2));
    return this.http.post<PredictionResponse>(this.apiUrl, data, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.message);
    return throwError('Something went wrong; please try again later.');
  }
}