import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ClubMember } from '../models/club-member.model';

@Injectable({
  providedIn: 'root'
})
export class ClubMembersService {
  // URL de l'API des quiz du club
  private apiUrl = 'http://localhost:8085/ElitGo/club-quiz';

  constructor(private http: HttpClient) { }

  /**
   * Récupère les membres d'un club spécifique (utilisateurs ayant réussi le quiz)
   * @param clubId ID du club
   * @returns Liste des membres du club
   */
  getClubMembers(clubId: number): Observable<ClubMember[]> {
    console.log(`Récupération des membres pour le club ${clubId}`);
    return this.http.get<any[]>(`${this.apiUrl}/club/${clubId}/members`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(`Erreur lors de la récupération des membres du club ${clubId}:`, error);
          
          if (error.status === 404) {
            return throwError(() => new Error(`Club ${clubId} non trouvé`));
          }
          
          // En cas d'erreur de connexion ou si l'API n'est pas encore déployée, utiliser des données de démo
          if (error.status === 0 || error.status === 500) {
            console.warn('Utilisation des données de démonstration pour les membres du club');
            return of(this.getDemoClubMembers(clubId));
          }
          
          return throwError(() => new Error('Erreur lors de la récupération des membres du club'));
        })
      );
  }

  /**
   * Génère des données de démonstration pour les membres du club
   * Utilisé uniquement en mode démo ou en cas d'indisponibilité de l'API
   */
  private getDemoClubMembers(clubId: number): ClubMember[] {
    // Simuler des données pour la démonstration
    return [
      {
        id: 1,
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        phoneNumber: '0123456789',
        quizScore: 85
      },
      {
        id: 2,
        nom: 'Martin',
        prenom: 'Sophie',
        email: 'sophie.martin@example.com',
        phoneNumber: '0123456788',
        quizScore: 92
      },
      {
        id: 3,
        nom: 'Dubois',
        prenom: 'Pierre',
        email: 'pierre.dubois@example.com',
        phoneNumber: '0123456787',
        quizScore: 78
      },
      {
        id: 4,
        nom: 'Robert',
        prenom: 'Marie',
        email: 'marie.robert@example.com',
        phoneNumber: '0123456786',
        quizScore: 95
      }
    ];
  }
}
