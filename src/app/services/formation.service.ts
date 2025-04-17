import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, } from 'rxjs';
import { Formation } from '../models/formation';
import { Review } from '../models/review';
import { catchError, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private apiUrl = 'http://localhost:8085/ElitGo/Formation';
  private reviewApiUrl = 'http://localhost:8085/ElitGo/api/reviews';

  constructor(private http: HttpClient) { }

  getAllFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/retrieve-all-formation`);
  }

  addFormationWithImage(formData: FormData): Observable<Formation> {
    return this.http.post<Formation>(`${this.apiUrl}/add-formation-with-image`, formData);
  }

  addFormation(formation: Formation): Observable<Formation> {
    const { id, ...formationWithoutId } = formation;

    return this.http.post<Formation>(
      `${this.apiUrl}/add-formation`,
      formationWithoutId,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }


  deleteFormation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-formation/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }


  updateFormation(formation: Formation): Observable<Formation> {
    return this.http.put<Formation>(`${this.apiUrl}/update-formation/${formation.id}`, formation, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      catchError((error: HttpErrorResponse) => {
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


  getFormationImageById(formationId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/image/${formationId}`, { responseType: 'blob' });
  }

  getPurchasedFormations(userId: number): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/purchased-formations/${userId}`);
  }

  getFormations(page: number, size: number): Observable<{ formations: Formation[], totalItems: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<{ formations: Formation[], totalItems: number }>(this.apiUrl, { params });
  }

  searchFormations(
    title: string,
    categoryName: string,
    minPrice: number | undefined,
    maxPrice: number | undefined,
    label: string,
    page: number,
    size: number
  ): Observable<{ formations: Formation[], totalItems: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (title) params = params.set('title', title);
    if (categoryName) params = params.set('categoryName', categoryName);
    if (minPrice !== undefined) params = params.set('minPrice', minPrice.toString());
    if (maxPrice !== undefined) params = params.set('maxPrice', maxPrice.toString());
    if (label) params = params.set('label', label);

    return this.http.get<{ formations: Formation[], totalItems: number }>(`${this.apiUrl}/search`, { params });
  }

  getReviewsByFormation(formationId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.reviewApiUrl}/formation/${formationId}`).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  // Optional: If you also want to fetch a specific review by user and formation
  getReviewByUserAndFormation(userId: number, formationId: number): Observable<Review> {
    return this.http.get<Review>(`${this.reviewApiUrl}/user/${userId}/formation/${formationId}`).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  updateDiscount(id: number, discount: number): Observable<Formation> {
    return this.http.put<Formation>(`${this.apiUrl}/formations/${id}/discount?discount=${discount}`, {});  }
  
  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}
