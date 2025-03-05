import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, } from 'rxjs';
import { Formation } from '../models/formation';
import { catchError, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private apiUrl = 'http://localhost:8085/ElitGo/Formation';

  constructor(private http: HttpClient) { }

  getFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/retrieve-all-formation`);
  }

  addFormationWithImage(formData: FormData): Observable<Formation> {
    return this.http.post<Formation>(`${this.apiUrl}/add-formation-with-image`, formData);
  }

  addFormation(formation: Formation): Observable<Formation> {
    const { id, ...formationWithoutId } = formation;

    console.log('Sending:', JSON.stringify(formationWithoutId));
    return this.http.post<Formation>(
      `${this.apiUrl}/add-formation`,
      formationWithoutId,
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


  deleteFormation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-formation/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Server error:', error.error);
        return throwError(() => error);
      })
    );
  }


  updateFormation(formation: Formation): Observable<Formation> {
    return this.http.put<Formation>(`${this.apiUrl}/update-formation/${formation.id}`, formation, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Server error:', error.error);
        return throwError(() => error);
      })
    );
  }
  updateFormationWithImage(id: number, formData: FormData): Observable<Formation> {
    return this.http.put<Formation>(`${this.apiUrl}/update-formation-with-image/${id}`, formData);
  }

  getFormationById(id: number): Observable<Formation> {
    return this.http.get<Formation>(`${this.apiUrl}/retrieve-formation/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Server error:', error.error);
        return throwError(() => error);
      })
    );
  }

  // Affecter une catégorie à une formation
  affecterCategoryAFormation(idFormation: number, categoryName: string): Observable<Formation> {
    return this.http.post<Formation>(
      `${this.apiUrl}/${idFormation}/affecter-category?categoryName=${categoryName}`,
      {} // Corps vide car tout est passé dans l'URL et les paramètres
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Gestion des erreurs
  private handleError(error: HttpErrorResponse) {
    console.error('Server error:', error.error);
    return throwError(() => error);
  }
  getFormationImageById(formationId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/image/${formationId}`, { responseType: 'blob' });
  }

}
