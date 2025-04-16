import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StudentAnswerService } from '../../services/student-answer.service';
import { Router } from '@angular/router';
import { StudentAnswer } from '../../models/student-answer.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-student-answer',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-student-answer.component.html',
  styleUrls: ['./create-student-answer.component.css'],
})
export class CreateStudentAnswerComponent {
  studentAnswerForm: FormGroup;

  constructor(
    private studentAnswerService: StudentAnswerService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.studentAnswerForm = this.fb.group({
      answer: ['', [Validators.required]],
      answerTime: ['', [Validators.required]],
      question: this.fb.group({
        question_id: ['', [Validators.required]],
      }),
    });
  }

  createStudentAnswer(): void {
    if (this.studentAnswerForm.invalid) {
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }

    const studentAnswerData = this.studentAnswerForm.value;
    this.studentAnswerService.addStudentAnswer(studentAnswerData).subscribe({
      next: (response) => {
        console.log('Réponse créée avec succès:', response);
        alert('Réponse créée avec succès !');
        this.studentAnswerForm.reset();
        this.router.navigate(['/student-answers']);
      },
      error: (err) => {
        console.error('Erreur lors de la création de la réponse :', err);
        alert('Erreur lors de la création de la réponse !');
      },
    });
  }
}