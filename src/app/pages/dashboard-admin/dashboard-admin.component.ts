import { Component, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';  // Import RouterModule

import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';
import { CreateQuestionComponent } from "../create-question/create-question.component";
import { CommonModule } from '@angular/common';
import { CreateQuizComponent } from "../create-quiz/create-quiz.component";
import { UpdateQuestionComponent } from "../update-question/update-question.component";
import { UpdateQuizComponent } from "../update-quiz/update-quiz.component";
import { QuizComponent } from "../Quiz/quiz.component";
import { QuestionComponent } from "../questions/questions.component";

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [DashboardHeaderComponent, RouterModule, CreateQuestionComponent, CommonModule, CreateQuizComponent, UpdateQuestionComponent, UpdateQuizComponent, QuizComponent, QuestionComponent],
  schemas: [NO_ERRORS_SCHEMA] ,
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css'
})
export class DashboardAdminComponent implements OnInit {
  ngOnInit(): void {
    this.userRole = this.getUserRole();
  }
  createquestion: boolean = false;
createQuiz: boolean = false;
updateQuestion: boolean = false;
updatequiz: boolean = false;
showQuiz: boolean = false;
showQuestion: boolean = false;
userRole: string | null = null;

getUserRole(): string | null {
  const role = sessionStorage.getItem('userRole');
  return role;
}// Réinitialise tous les flags à false
resetDisplayFlags(): void {
  this.createquestion = false;
  this.createQuiz = false;
  this.updateQuestion = false;
  this.updatequiz = false;
  this.showQuiz = false;
  this.showQuestion = false;
}

// Affiche uniquement le formulaire de création de question
displayCreateQuestion(): void {
  this.resetDisplayFlags();
  this.createquestion = true;
}


// Affiche uniquement le formulaire de création de quiz
displayCreateQuiz(): void {
  this.resetDisplayFlags();
  this.createQuiz = true;
}

// Affiche uniquement le formulaire de mise à jour de question
displayUpdateQuestion(): void {
  this.resetDisplayFlags();
  this.updateQuestion = true;
}

// Affiche uniquement le formulaire de mise à jour de quiz
displayUpdateQuiz(): void {
  this.resetDisplayFlags();
  this.updatequiz = true;
}

// Affiche uniquement la liste des quiz
displayShowQuiz(): void {
  this.resetDisplayFlags();
  this.showQuiz = true;
}

// Affiche uniquement la liste des questions
displayShowQuestion(): void {
  this.resetDisplayFlags();
  this.showQuestion = true;
}

}
