import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { QuestionService } from '../../services/question.service';
import { Router } from '@angular/router';
import { Question } from '../../models/question.model';
import { CommonModule } from '@angular/common';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-create-question',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-question.component.html',
  styleUrls: ['./create-question.component.css'],
})
export class CreateQuestionComponent implements OnInit {
  questionForm: FormGroup;
  difficulties: string[] = ['easy', 'midium', 'hard'];
  quizzes: any[] = [];

  selectedImage: File | null = null;
  uploadedImageUrl: string = '';
  question: any;

  constructor(
    private questionService: QuestionService,
    private router: Router,
    private fb: FormBuilder,
    private quizservice: QuizService
  ) {
    this.questionForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(10)]],
      difficulty: ['', [Validators.required]],
      choices: ['', [Validators.required]],
      correctAnswer: ['', [Validators.required]],
      quiz: this.fb.group({
        quizId: ['', [Validators.required]],
      }),
    });
  }

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes() {
    this.quizservice.getQuizzes().subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des quizzes:', err);
        alert('Erreur lors du chargement des quizzes.');
      },
    });
  }

  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0];

    if (this.selectedImage) {
      this.questionService.uploadImage(this.selectedImage).subscribe({
        next: (url: string) => {
          console.log('Image uploaded, URL:', url);
          this.question.imageUrl = url; // <- c’est ça qu’on veut !
        },
        error: err => {
          console.error('Erreur lors de l’upload', err);
        }
      });
    }
  }

 /*  createQuestion() {
    if (this.questionForm.invalid) {
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }

    const questionData: Question = {
      text: this.questionForm.value.text,
      difficulty: this.questionForm.value.difficulty,
      choices: this.questionForm.value.choices.split(',').map((c: string) => c.trim()),
      correctAnswer: this.questionForm.value.correctAnswer,
      imageUrl: this.uploadedImageUrl || '',
      quizId: {
        quizId: this.questionForm.value.quiz.quizId
      }
    };

    console.log('Données envoyées à l\'API:', questionData);

    this.questionService.addQuestion(questionData).subscribe({
      next: (response) => {
        console.log('Question créée avec succès:', response);
        alert('Question créée avec succès !');
        this.questionForm.reset();
        this.router.navigate(['/questions']);
      },
      error: (err) => {
        console.error('Erreur lors de la création de la question:', err);
        alert('Erreur lors de la création de la question !');
      },
    });
  } */
  submitQuestion() {
    if (this.questionForm.invalid) {
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }
  
    const question: Question = {
      text: this.questionForm.value.text,
      difficulty: this.questionForm.value.difficulty,
      choices: this.questionForm.value.choices.split(',').map((c: string) => c.trim()),
      correctAnswer: this.questionForm.value.correctAnswer,
      quizId: { quizId: this.questionForm.value.quiz.quizId }
    };
  
    this.questionService.addQuestionWithImage(question, this.selectedFile).subscribe({
      next: (res) => {
        console.log('Question ajoutée', res);
        alert('Question ajoutée avec succès !');
        this.questionForm.reset();
        this.router.navigate(['/questions']);
      },
      error: (err) => {
        console.error('Erreur lors de l’ajout', err);
        alert('Erreur lors de l’ajout de la question');
      }
    });
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Fichier sélectionné :', this.selectedFile);
    }
  }
  
selectedFile: File | null = null;
  
}
