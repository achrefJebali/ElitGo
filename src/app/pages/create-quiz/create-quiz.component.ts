import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { QuizService } from '../../services/quiz.service';
import { Router } from '@angular/router';
import { Quiz } from '../../models/quiz.model';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-quiz',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DashboardHeaderComponent], // Add ReactiveFormsModule here
  templateUrl: './create-quiz.component.html',
  styleUrls: ['./create-quiz.component.css'],
})
export class CreateQuizComponent {
  quizForm: FormGroup;
  categories: string[] = ['Math', 'Science', 'History', 'Programming']; // Exemple de catégories

  constructor(
    private quizService: QuizService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.quizForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      duration: [null, [Validators.required, Validators.min(1)]],
      nbrquestions: [null, [Validators.required, Validators.min(1)]],
      categories: ['', [Validators.required]],
    });
  }

  createQuiz() {
    if (this.quizForm.invalid) {
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }

    const quizData: Quiz = {
      quizId: 0, // Assuming 0 or null for new quiz creation
      ...this.quizForm.value
    };
    this.quizService.createQuiz(quizData).subscribe({
      next: (response) => {
        console.log('Quiz créé avec succès:', response);
        alert('Quiz créé avec succès !');
        this.quizForm.reset(); // Réinitialiser le formulaire
        this.router.navigate(['/quiz']); // Redirection
      },
      error: (err) => {
        console.error('Erreur lors de la création du quiz:', err);
        alert('Erreur lors de la création du quiz !');
      },
    });
  }
}