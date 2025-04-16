import { Component, OnInit } from '@angular/core';
import { StudentAnswerService } from '../../services/student-answer.service';
import { StudentAnswer } from '../../models/student-answer.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-answers',
  templateUrl: './student-answers.component.html',
  styleUrls: ['./student-answers.component.css'],
})
export class StudentAnswersComponent implements OnInit {
  studentAnswers: StudentAnswer[] = [];
  isLoading = false;

  constructor(
    private studentAnswerService: StudentAnswerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStudentAnswers();
  }

  loadStudentAnswers(): void {
    this.isLoading = true;
    this.studentAnswerService.getAllStudentAnswers().subscribe({
      next: (answers) => {
        this.studentAnswers = answers;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des réponses :', err);
        this.isLoading = false;
      },
    });
  }

  deleteStudentAnswer(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réponse ?')) {
      this.studentAnswerService.deleteStudentAnswer(id).subscribe({
        next: () => {
          this.studentAnswers = this.studentAnswers.filter((sa) => sa.id !== id);
          alert('Réponse supprimée avec succès !');
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la réponse :', err);
          alert('Une erreur est survenue lors de la suppression de la réponse.');
        },
      });
    }
  }

  navigateToUpdateStudentAnswer(id: number): void {
    this.router.navigate(['/update-student-answer', id]);
  }
}