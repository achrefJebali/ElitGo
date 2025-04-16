import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { StudentAnswer } from '../models/student-answer.model';

@Injectable({
  providedIn: 'root',
})
export class StudentAnswerService {
  private apiUrl = 'http://localhost:8085/api/student-answers'; // URL de l'API

  constructor(private http: HttpClient) {}

  getAllStudentAnswers(): Observable<StudentAnswer[]> {
    return this.http.get<StudentAnswer[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getStudentAnswerById(id: number): Observable<StudentAnswer> {
    return this.http.get<StudentAnswer>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  addStudentAnswer(studentAnswer: StudentAnswer): Observable<StudentAnswer> {
    return this.http.post<StudentAnswer>(`${this.apiUrl}/submit`, studentAnswer).pipe(
      catchError(this.handleError)
    );
  }

  updateStudentAnswer(id: number, studentAnswer: StudentAnswer): Observable<StudentAnswer> {
    return this.http.put<StudentAnswer>(`${this.apiUrl}/${id}`, studentAnswer).pipe(
      catchError(this.handleError)
    );
  }

  deleteStudentAnswer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur s\'est produite';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      errorMessage = `Code de statut: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}