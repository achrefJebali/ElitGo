import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Category } from 'app/models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:8085/ElitGo/Category';

  constructor(private http: HttpClient) { }

  // Récupère la liste des catégories depuis le backend
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/retrieve-all-category`).pipe(
      catchError(this.handleError)
    );
  }
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/remove-category/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  addCategory(category: Category): Observable<Category> {
    const { id, ...categoryWithoutId } = category;

    console.log('Sending:', JSON.stringify(categoryWithoutId));
    return this.http.post<Category>(
      `${this.apiUrl}/add-category`,
      categoryWithoutId,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Server error:', error.error);
        return throwError(() => error);
      })
    );
  }

  // Gestion des erreurs
  private handleError(error: HttpErrorResponse) {
    console.error('Server error:', error.error);
    return throwError(() => error);
  }


}