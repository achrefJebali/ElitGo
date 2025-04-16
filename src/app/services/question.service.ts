import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Question } from '../models/question.model';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private apiUrl = 'http://localhost:8085/ElitGo/question'; // URL de l'API

  constructor(private http: HttpClient) {}

  getAllQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/all`);
  }

  getQuestionById(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/get/${id}`);
  }

  addQuestionWithImage(question: Question,  imageFile?: File | null): Observable<Question> {
    const formData = new FormData();
  
    // Convertir l’objet `question` en JSON stringifié
    formData.append('question', new Blob([JSON.stringify(question)], { type: 'application/json' }));
  
    // Ajouter le fichier image s’il existe
    if (imageFile) {
      formData.append('file', imageFile);
    }
  
    return this.http.post<Question>(`${this.apiUrl}/add`, formData);
  }
  

  updateQuestion(id: number, question: Question): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/update/${id}`, question);
  }
  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);
  
    return this.http.post('http://localhost:8080/question/upload-image', formData, {
      responseType: 'text'  // important pour récupérer l'URL en texte
    });
  }
  

  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
