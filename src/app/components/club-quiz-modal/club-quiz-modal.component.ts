import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClubQuiz, ClubQuizQuestion, ClubQuizSubmission } from '../../models/club-quiz.model';
import { ClubQuizService } from '../../services/club-quiz.service';

@Component({
  selector: 'app-club-quiz-modal',
  templateUrl: './club-quiz-modal.component.html',
  styleUrls: ['./club-quiz-modal.component.css']
})
export class ClubQuizModalComponent implements OnInit {
  @Input() clubId: number = 0;
  @Input() userId: number = 1; // Utilisateur actuel (à adapter selon votre contexte)
  @Output() quizCompleted = new EventEmitter<ClubQuizSubmission | undefined>();
  
  quiz: ClubQuiz | undefined;
  questions: ClubQuizQuestion[] = [];
  currentQuestionIndex: number = 0;
  showResult: boolean = false;
  
  // Réponses de l'utilisateur (questionId -> optionIndex)
  userAnswers: {[key: number]: number} = {};
  
  // Résultat du quiz
  quizResult: ClubQuizSubmission | undefined;
  
  // État du chargement
  loading: boolean = false;
  error: string = '';

  constructor(private clubQuizService: ClubQuizService) { }

  ngOnInit(): void {
    this.loadQuiz();
  }

  loadQuiz(): void {
    this.loading = true;
    // Récupérer le premier quiz du club (on suppose qu'il n'y en a qu'un seul pour l'instant)
    if (this.clubId) {
      this.clubQuizService.getQuizzesByClubId(this.clubId).subscribe({
      next: (quizzes) => {
        if (quizzes && quizzes.length > 0) {
          this.quiz = quizzes[0];
          if (this.quiz && this.quiz.id) {
            this.loadQuestions(this.quiz.id);
          } else {
            this.error = 'Erreur: Quiz incomplet.';
            this.loading = false;
          }
        } else {
          this.error = 'Aucun quiz disponible pour ce club.';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des quiz:', err);
        this.error = 'Erreur lors du chargement des quiz. Veuillez réessayer.';
        this.loading = false;
      }
    });
    } else {
      this.error = 'ID du club non défini.';
      this.loading = false;
    }
  }

  loadQuestions(quizId: number): void {
    this.clubQuizService.getQuestionsByQuizId(quizId).subscribe({
      next: (questions) => {
        this.questions = questions;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des questions:', err);
        this.error = 'Erreur lors du chargement des questions. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  get currentQuestion(): ClubQuizQuestion | undefined {
    return this.questions.length > this.currentQuestionIndex ? this.questions[this.currentQuestionIndex] : undefined;
  }

  selectOption(questionId: number, optionIndex: number): void {
    this.userAnswers[questionId] = optionIndex;
  }

  isOptionSelected(questionId: number, optionIndex: number): boolean {
    return this.userAnswers[questionId] === optionIndex;
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  submitQuiz(): void {
    this.loading = true;
    if (this.quiz?.id) {
      console.log('Soumission du quiz, réponses:', this.userAnswers);
      this.clubQuizService.submitQuiz(this.quiz.id, this.userId, this.userAnswers).subscribe({
      next: (result) => {
        console.log('Résultat du quiz reçu:', result);
        this.quizResult = result;
        this.showResult = true;
        this.loading = false;
        
        // Afficher les logs de débogage pour vérifier l'état
        console.log('showResult:', this.showResult);
        console.log('quizResult passed:', this.quizResult.passed);
        console.log('quizResult score:', this.quizResult.score);
        
        // NE PAS émettre le résultat maintenant
        // Laissons l'utilisateur voir le résultat et fermer manuellement avec le bouton
        // L'émission se fera dans la méthode closeModal() si le quiz est réussi
      },
      error: (err) => {
        console.error('Erreur lors de la soumission du quiz:', err);
        this.error = 'Erreur lors de la soumission du quiz. Veuillez réessayer.';
        this.loading = false;
      }
    });
    } else {
      this.error = 'Impossible de soumettre: quiz non défini.';
      this.loading = false;
    }
  }

  restartQuiz(): void {
    this.currentQuestionIndex = 0;
    this.userAnswers = {};
    this.showResult = false;
    this.quizResult = undefined;
  }

  closeModal(): void {
    console.log('Fermeture du modal, quizResult:', this.quizResult);
    // Si nous avons un résultat et que le quiz est réussi, émettre le résultat
    // Sinon, émettre undefined pour simplement fermer sans action
    if (this.quizResult && this.quizResult.passed) {
      console.log('Quiz réussi, émission du résultat positif');
      this.quizCompleted.emit(this.quizResult);
    } else {
      console.log('Quiz non réussi ou pas de résultat, fermeture simple');
      this.quizCompleted.emit(undefined);
    }
  }
}
