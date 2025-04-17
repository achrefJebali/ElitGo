import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { ClubQuiz, ClubQuizQuestion, ClubQuizSubmission } from '../models/club-quiz.model';
import { delay, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClubQuizService {
  private apiUrl = 'http://localhost:8085/ElitGo/club-quiz';
  private useDemoData = false; // Utilisation des API réelles

  constructor(private http: HttpClient) { }

  // Quiz methods
  getQuizById(id: number): Observable<ClubQuiz> {
    // Simulation des données pour la démo
    if (this.useDemoData) {
      return this.getDemoQuiz(id);
    }
    
    console.log(`Récupération du quiz avec l'ID ${id}`);
    return this.http.get<ClubQuiz>(`${this.apiUrl}/quiz/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Erreur lors de la récupération du quiz ${id}:`, error);
          if (error.status === 404) {
            return throwError(() => new Error(`Quiz ${id} non trouvé`));
          }
          return throwError(() => new Error('Erreur lors de la récupération du quiz'));
        })
      );
  }

  getQuizzesByClubId(clubId: number): Observable<ClubQuiz[]> {
    // Simulation des données pour la démo
    if (this.useDemoData) {
      return this.getDemoQuizzesByClubId(clubId);
    }
    
    console.log(`Récupération des quiz pour le club ${clubId}`);
    return this.http.get<ClubQuiz[]>(`${this.apiUrl}/club/${clubId}/quizzes`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(`Erreur lors de la récupération des quiz pour le club ${clubId}:`, error);
          if (error.status === 404) {
            return throwError(() => new Error(`Club ${clubId} non trouvé`));
          }
          return throwError(() => new Error('Erreur lors de la récupération des quiz'));
        })
      );
  }

  // Question methods
  getQuestionsByQuizId(quizId: number): Observable<ClubQuizQuestion[]> {
    // Simulation des données pour la démo
    if (this.useDemoData) {
      return this.getDemoQuestions(quizId);
    }
    
    console.log(`Récupération des questions pour le quiz ${quizId}`);
    return this.http.get<ClubQuizQuestion[]>(`${this.apiUrl}/quiz/${quizId}/questions`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(`Erreur lors de la récupération des questions pour le quiz ${quizId}:`, error);
          if (error.status === 404) {
            return throwError(() => new Error(`Quiz ${quizId} non trouvé`));
          }
          return throwError(() => new Error('Erreur lors de la récupération des questions'));
        })
      );
  }

  // Submission methods
  submitQuiz(quizId: number, userId: number, answers: {[key: number]: number}): Observable<ClubQuizSubmission> {
    // Simulation des données pour la démo
    if (this.useDemoData) {
      return this.simulateQuizSubmission(quizId, userId, answers);
    }

    // Appel au backend avec gestion d'erreurs
    console.log(`Soumission du quiz ${quizId} pour l'utilisateur ${userId} avec les réponses:`, answers);
    return this.http.post<ClubQuizSubmission>(`${this.apiUrl}/quiz/${quizId}/submit?userId=${userId}`, answers)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la soumission du quiz:', error);
          if (error.status === 404) {
            return throwError(() => new Error('Quiz ou utilisateur non trouvé'));
          }
          return throwError(() => new Error('Erreur lors de la soumission du quiz'));
        })
      );
  }

  getUserSubmissions(userId: number): Observable<ClubQuizSubmission[]> {
    // Simulation des données pour la démo
    if (this.useDemoData) {
      return of([]).pipe(delay(300));
    }
    
    console.log(`Récupération des soumissions pour l'utilisateur ${userId}`);
    return this.http.get<ClubQuizSubmission[]>(`${this.apiUrl}/user/${userId}/submissions`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(`Erreur lors de la récupération des soumissions pour l'utilisateur ${userId}:`, error);
          if (error.status === 404) {
            return throwError(() => new Error(`Utilisateur ${userId} non trouvé`));
          }
          return throwError(() => new Error('Erreur lors de la récupération des soumissions'));
        })
      );
  }

  hasUserPassedQuiz(userId: number, quizId: number): Observable<boolean> {
    // Simulation des données pour la démo
    if (this.useDemoData) {
      return of(false).pipe(delay(300));
    }
    
    console.log(`Vérification si l'utilisateur ${userId} a réussi le quiz ${quizId}`);
    return this.http.get<boolean>(`${this.apiUrl}/user/${userId}/passed/${quizId}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(`Erreur lors de la vérification si l'utilisateur ${userId} a réussi le quiz ${quizId}:`, error);
          if (error.status === 404) {
            return throwError(() => new Error('Utilisateur ou quiz non trouvé'));
          }
          return throwError(() => new Error('Erreur lors de la vérification'));
        })
      );
  }

  // Méthodes de démo pour simuler les données
  private getDemoQuizzesByClubId(clubId: number): Observable<ClubQuiz[]> {
    const quiz: ClubQuiz = {
      id: 1,
      title: `Quiz d'admission - Club ${clubId}`,
      description: 'Répondez correctement à ces questions pour rejoindre notre club!',
      passingScore: 70
    };
    
    return of([quiz]).pipe(delay(500)); // Délai simulé de 500ms
  }

  private getDemoQuiz(quizId: number): Observable<ClubQuiz> {
    const quiz: ClubQuiz = {
      id: quizId,
      title: `Quiz d'admission`,
      description: 'Répondez correctement à ces questions pour rejoindre notre club!',
      passingScore: 70
    };
    
    return of(quiz).pipe(delay(300));
  }

  private getDemoQuestions(quizId: number): Observable<ClubQuizQuestion[]> {
    const questions: ClubQuizQuestion[] = [
      {
        id: 1,
        questionText: 'Quelle est la mission principale d\'un club étudiant?',
        options: [
          'Organiser des fêtes uniquement',
          'Développer des compétences et créer des opportunités',
          'Remplir le CV des étudiants',
          'Établir des hiérarchies parmi les étudiants'
        ],
        correctOptionIndex: 1,
        points: 20
      },
      {
        id: 2,
        questionText: 'Quel est l\'avantage principal de rejoindre un club?',
        options: [
          'Éviter d\'assister aux cours',
          'Avoir accès à la cafétéria en priorité',
          'Développer son réseau professionnel',
          'Pouvoir quitter l\'école plus tôt'
        ],
        correctOptionIndex: 2,
        points: 20
      },
      {
        id: 3,
        questionText: 'Comment contribueriez-vous au développement du club?',
        options: [
          'Je ne participerai qu\'aux événements qui m\'intéressent',
          'Je viendrai uniquement pour le buffet',
          'J\'apporterai de nouvelles idées et participerai activement',
          'Je laisserai les autres travailler'
        ],
        correctOptionIndex: 2,
        points: 20
      },
      {
        id: 4,
        questionText: 'Quelle est la qualité la plus importante pour un membre de club?',
        options: [
          'L\'engagement et la fiabilité',
          'La capacité à éviter les responsabilités',
          'La capacité à s\'imposer face aux autres',
          'La disponibilité uniquement pendant les vacances'
        ],
        correctOptionIndex: 0,
        points: 20
      },
      {
        id: 5,
        questionText: 'Combien de temps pouvez-vous consacrer au club chaque semaine?',
        options: [
          'Moins d\'une heure',
          '1-2 heures',
          '3-5 heures',
          'Plus de 5 heures'
        ],
        correctOptionIndex: 2,
        points: 20
      }
    ];
    
    return of(questions).pipe(delay(700));
  }

  private simulateQuizSubmission(quizId: number, userId: number, answers: {[key: number]: number}): Observable<ClubQuizSubmission> {
    // Simuler l'évaluation du quiz
    const correctAnswers: {[key: number]: number} = {
      1: 1, // Question 1, réponse B (index 1)
      2: 2, // Question 2, réponse C (index 2)
      3: 2, // Question 3, réponse C (index 2)
      4: 0, // Question 4, réponse A (index 0)
      5: 2  // Question 5, réponse C (index 2)
    };
    
    let correctCount = 0;
    let totalQuestions = Object.keys(correctAnswers).length;
    
    for (const [questionId, answerIndex] of Object.entries(answers)) {
      const qId = parseInt(questionId);
      if (correctAnswers[qId] === answerIndex) {
        correctCount++;
      }
    }
    
    const scorePercentage = Math.floor((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= 70; // Seuil de réussite à 70%
    
    const submission: ClubQuizSubmission = {
      id: 1,
      submissionDate: new Date(),
      score: scorePercentage,
      passed: passed,
      answers: answers,
      quiz: {
        id: quizId,
        title: 'Quiz d\'admission',
        description: 'Quiz pour rejoindre le club',
        passingScore: 70
      },
      user: { id: userId }
    };
    
    return of(submission).pipe(delay(1000)); // Délai simulé de 1 seconde
  }
}
