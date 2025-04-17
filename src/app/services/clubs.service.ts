import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError, tap } from 'rxjs';
import { Club } from '../models/club.model';

@Injectable({
  providedIn: 'root'
})
export class ClubsService {
  private API_URL = 'http://localhost:8085/ElitGo';// URL du backend pour les clubs

  constructor(private http: HttpClient) {}

  getClubs(): Observable<Club[]> {
    const url = this.API_URL + "/Club/retrieve-all-club";
    console.log('URL de récupération des clubs :', url);
    return this.http.get<any>(url).pipe(
      tap(response => {
        console.log('Réponse brute du serveur :', response);
        // Check if the response is already an array or wrapped in a property
        if (response && !Array.isArray(response)) {
          // Try to extract clubs array from common API response formats
          const possibleArrays = ['data', 'clubs', 'content', 'items', 'results'];
          for (const key of possibleArrays) {
            if (response[key] && Array.isArray(response[key])) {
              console.log(`Clubs trouvés dans la propriété '${key}'`, response[key]);
              return response[key];
            }
          }
        }
        return response;
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des clubs :', error);
        return throwError(() => new Error('Erreur lors de la récupération des clubs'));
      })
    );
  }

  addClub(club: Club): Observable<Club> {
    const { id, ...clubWithoutId } = club;
    console.log('Sending:', JSON.stringify(clubWithoutId));
    return this.http.post<Club>(`${this.API_URL}/Club/add-club`, clubWithoutId, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      catchError(this.handleError)
    );
  }

  deleteClub(clubId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/Club/remove-club/${clubId}`).pipe(
      catchError(this.handleError)
    );
  }

  updateClub(club: Club): Observable<Club> {
    console.log('Mise à jour du club avec les données:', JSON.stringify(club));
    return this.http.put<Club>(`${this.API_URL}/Club/modify-club`, club).pipe(
      catchError(this.handleError)
    );
  }
  
  // Méthode pour télécharger une image pour un club
  uploadClubImage(clubId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    console.log('Envoi du fichier pour le club ID:', clubId, 'Nom du fichier:', file.name);
    
    // Utilise responseType: 'text' pour recevoir la réponse sous forme de texte (chemin de l'image)
    return this.http.post(`${this.API_URL}/Club/upload-image/${clubId}`, formData, {
      responseType: 'text'
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
