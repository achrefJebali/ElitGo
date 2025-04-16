import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Quiz } from '../models/quiz.model';
import { Question } from '../models/question.model';
import { QuestionDTO } from '../models/question-dto';
@Injectable({
  providedIn: 'root',
})
export class QuizService {
  getQuizById(quizId: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/getid-quiz/${quizId}`).pipe(
      catchError(this.handleError)
    );
  }
  // private apiUrl = 'http://localhost:8085/ElitGo/quizzes'; // URL de l'API
  private apiUrl = 'http://localhost:8085/ElitGo/quiz'; // URL de l'API
  
  constructor(private http: HttpClient) {}

  getQuizzes(): Observable<Quiz[]> {
    
    return this.http.get<Quiz[]>(`${this.apiUrl}/allQuizzes`);
  } 
  // getQuizzes(): Observable<Quiz[]> {
    
  //   return this.http.get<Quiz[]>(`${this.apiUrl}/all-quiz`);
  // } 

  createQuiz(quiz: Quiz): Observable<Quiz> {
    const { quizId, ...quizWithoutId } = quiz;
    return this.http.post<Quiz>(`${this.apiUrl}/addQuiz`, quizWithoutId, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    }).pipe(
      catchError(this.handleError)
    );
  }

  // deleteQuiz(quizId: number): Observable<Quiz> {
  //   return this.http.delete<Quiz>(`${this.apiUrl}/delete-quiz/${quizId}`);
  // }
  deleteQuiz(quizId: number): Observable<Quiz> {
    return this.http.delete<Quiz>(`${this.apiUrl}/deleteQuiz/${quizId}`)  }

    updateQuiz(quizId: number, quiz: Quiz): Observable<Quiz> {
      // On utilise directement l'ID du quiz ici, donc il n'est pas nécessaire de l'exclure de l'objet 'quiz'.
      return this.http.put<Quiz>(`${this.apiUrl}/update/${quizId}`, quiz, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      }).pipe(
        catchError(this.handleError) // Capture les erreurs éventuelles
      );
    }
    getQuestionsByQuizId(quizId: number): Observable<QuestionDTO[]> {
      return this.http.get<QuestionDTO[]>(`http://localhost:8085/ElitGo/question/getQuestionsByQuizId/${quizId}`);
    }
  getQuiz(quizId: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/getQuiz/${quizId}`);
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