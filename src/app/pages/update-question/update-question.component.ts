import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { QuestionService } from '../../services/question.service';
import { Question } from '../../models/question.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-update-question',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './update-question.component.html',
  styleUrls: ['./update-question.component.css'],
})
export class UpdateQuestionComponent implements OnInit {
  questionForm: FormGroup;
  questionId: number;
  isLoading = false;
  question: Question | null = null;
choices: any;
correctAnswer: any;
text: any;

  constructor(
    private questionService: QuestionService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.questionForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(5)]],
      difficulty: ['easy', Validators.required],
      choices: ['', [Validators.required, this.validateChoices]],
      correctAnswer: ['', Validators.required],
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.questionId = isNaN(id) ? 0 : id;
  }

  ngOnInit(): void {
    if (!this.questionId) {
      console.error("Invalid question ID");
      this.router.navigate(['/questions']);
      return;
    }
    this.loadQuestion();
  }

  private validateChoices(control: AbstractControl) {
    const value = control.value;
    if (!value) return null;
    const choices = value.split(',').map((c: string) => c.trim());
    return choices.length >= 2 ? null : { invalidChoices: true };
  }

  loadQuestion(): void {
    this.isLoading = true;
    this.questionService.getQuestionById(this.questionId).subscribe({
      next: (data) => {
        if (!data) {
          throw new Error('Question not found');
        }

        this.question = {
          ...data,
          choices: data.choices || []
        };

        this.questionForm.patchValue({
          text: this.question.text,
          difficulty: this.question.difficulty,
          choices: this.question.choices.join(', '),
          correctAnswer: this.question.correctAnswer,
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading question:', err);
        this.isLoading = false;
        this.router.navigate(['/questions']);
      }
    });
  }

  updateQuestion(): void {
    if (this.questionForm.invalid || !this.question) {
      this.markAllAsTouched();
      return;
    }
  
    const updatedQuestion: Question = {
      ...this.question,
      ...this.questionForm.value,
      choices: this.questionForm.value.choices.split(',').map((c: string) => c.trim()),
      question_id: this.questionId  // Assure-toi que l'ID est bien utilisé ici
    };
  
    this.isLoading = true;
    this.questionService.updateQuestion(this.questionId, updatedQuestion).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/questions'], {
          state: { message: 'Question updated successfully' }
        });
      },
      error: (err) => {
        console.error('Update error:', err);
        this.isLoading = false;
      }
    });
  }
  
  

  private markAllAsTouched(): void {
    Object.values(this.questionForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  cancelUpdate(): void {
    if (this.questionForm.dirty) {
      if (confirm('Are you sure you want to discard changes?')) {
        this.router.navigate(['/questions']);
      }
    } else {
      this.router.navigate(['/questions']);
    }
  }

  // Getters pour les contrôles du formulaire
  get textControl() { return this.questionForm.get('text'); }
  get difficultyControl() { return this.questionForm.get('difficulty'); }
  get choicesControl() { return this.questionForm.get('choices'); }
  get correctAnswerControl() { return this.questionForm.get('correctAnswer'); }
}