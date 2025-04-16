// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-update-quiz',
//   standalone: true,
//   imports: [],
//   templateUrl: './update-quiz.component.html',
//   styleUrl: './update-quiz.component.css'
// })
// export class UpdateQuizComponent {

// }

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { QuizService } from '../../services/quiz.service';
import { Quiz } from '../../models/quiz.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardHeaderComponent } from "../dashboard/dashboard-header/dashboard-header.component";

@Component({
  selector: 'app-update-quiz',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DashboardHeaderComponent],
  templateUrl: './update-quiz.component.html',
  styleUrls: ['./update-quiz.component.css'],
})
export class UpdateQuizComponent implements OnInit {
  onSubmit() {
    throw new Error('Method not implemented.');
  }
  quizForm!: FormGroup;
  quizId!: number;
  isLoading = true;
  quiz: Quiz | undefined;

  constructor(
    private QuizService: QuizService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.quizForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      duration: [null, [Validators.required, Validators.min(1)]],
      nbrquestions: [null, [Validators.required, Validators.min(1)]],
      categories: ['']
    });
    this.quizId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadQuiz();
  }

  /**
   * Charge le quiz à éditer et remplit le formulaire.
   */
  loadQuiz(): void {
    this.isLoading = true;
    this.QuizService.getQuiz(this.quizId).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
        this.quizForm.patchValue(quiz);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du quiz', err);
        this.isLoading = false;
      },
    });
  }

  /**
   * Soumet la mise à jour du quiz.
   */
  updateQuiz(): void {
    if (this.quizForm.invalid) {
      return;
    }

    const updatedQuiz: Quiz = {
      quizId: this.quizId,
      ...this.quizForm.value,
    };

    this.isLoading = true;
    this.QuizService.updateQuiz(this.quizId, updatedQuiz).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/quiz']);
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du quiz', err);
        this.isLoading = false;
      },
    });
  }

  /**
   * Getters pour faciliter l'accès aux champs du formulaire dans le template.
   */
  get title() {
    return this.quizForm.get('title');
  }
  get description() {
    return this.quizForm.get('description');
  }
  get duration() {
    return this.quizForm.get('duration');
  }
  get nbrquestions() {
    return this.quizForm.get('nbrquestions');
  }
  get categories() {
    return this.quizForm.get('categories');
  }
}
