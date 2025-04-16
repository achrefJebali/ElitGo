import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StudentAnswerService } from '../../services/student-answer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentAnswer } from '../../models/student-answer.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-student-answer',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './update-student-answer.component.html',
  styleUrls: ['./update-student-answer.component.css'],
})
export class UpdateStudentAnswerComponent implements OnInit {
  studentAnswerForm: FormGroup;
  studentAnswerId!: number;

  constructor(
    private studentAnswerService: StudentAnswerService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.studentAnswerForm = this.fb.group({
      answer: ['', [Validators.required]],
      answerTime: ['', [Validators.required]],
      question: this.fb.group({
        question_id: ['', [Validators.required]],
      }),
    });
  }

  ngOnInit(): void {
    this.studentAnswerId = +this.route.snapshot.paramMap.get('id')!;
    this.loadStudentAnswer(this.studentAnswerId);
  }

  loadStudentAnswer(id: number): void {
    this.studentAnswerService.getStudentAnswerById(id).subscribe({
      next: (answer) => {
        this.studentAnswerForm.patchValue(answer);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la réponse :', err);
        alert('Erreur lors du chargement de la réponse !');
      },
    });
  }

  updateStudentAnswer(): void {
    if (this.studentAnswerForm.invalid) {
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }

    const studentAnswerData = this.studentAnswerForm.value;
    this.studentAnswerService.updateStudentAnswer(this.studentAnswerId, studentAnswerData).subscribe({
      next: (response) => {
        console.log('Réponse mise à jour avec succès:', response);
        alert('Réponse mise à jour avec succès !');
        this.router.navigate(['/student-answers']);
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de la réponse :', err);
        alert('Erreur lors de la mise à jour de la réponse !');
      },
    });
  }
}