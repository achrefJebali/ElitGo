import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError, map, of } from 'rxjs';
import { Event } from '../models/event.model';
@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private apiUrl = 'http://localhost:8085/ElitGo/Event';// Mets l'URL correcte de ton backend
  constructor(private http: HttpClient) {}

  registerUserForEvent(eventId: number, userId: number): Observable<any> {
    const url = `${this.apiUrl}/${eventId}/register`;
  
  const payload = { userId: userId };
  
  return this.http.post(url, payload, {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  }).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Erreur lors de l\'enregistrement:', error.error);
      return throwError(() => error);
    })
  );
  }

  getEvents(): Observable<any> {
    // Essayer de récupérer les événements avec leurs plannings inclus
    return this.http.get<any>(`${this.apiUrl}/retrieve-all-event`);
  }

  // Méthode pour récupérer les événements avec leurs plannings
  getEventsWithPlannings(): Observable<Event[]> {
    return this.http.get<any>(`${this.apiUrl}/retrieve-all-event`).pipe(
      map(response => {
        // Vérifie différents formats possibles de réponse
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object') {
          // Essaie de trouver un tableau dans la réponse
          for (const key in response) {
            if (Array.isArray(response[key])) {
              return response[key];
            }
          }
        }
        console.warn('Format de réponse inattendu:', response);
        return [];
      }),
      catchError(error => {
        console.error('Erreur de récupération des événements:', error);
        return of([]);
      })
    );
  }
  addEvent(event: Event): Observable<Event> {
    // On extrait l'ID (auto-généré) pour ne pas l'envoyer au backend
    const { id, ...eventWithoutId } = event;

    console.log('Sending:', JSON.stringify(eventWithoutId));

    return this.http.post<Event>(`${this.apiUrl}/add-event`, eventWithoutId, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Server error:', error.error);
        return throwError(() => error);
      })
    );
  }
  deleteEvent(eventId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove-event/${eventId}`);
  }

  
  updateEvent(event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/modify-event`, event);
  }

  // Méthode pour uploader une image pour un événement
  uploadEventImage(eventId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/upload-image/${eventId}`, formData, {
      responseType: 'text'  // Spécifier que la réponse est du texte et non du JSON
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur d\'upload:', error.error);
        return throwError(() => error);
      })
    );
  }
}
