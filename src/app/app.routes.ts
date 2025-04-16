import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { InscriptionComponent } from './pages/inscription/inscription.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardProfileComponent } from './pages/dashboard-profile/dashboard-profile.component';
import { DashboardSettingsComponent } from './pages/dashboard-settings/dashboard-settings.component';
import { FooterComponent } from './pages/footer/footer.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { RecoverComponent } from './pages/recover/recover.component';
import { DashboardAdminComponent } from './pages/dashboard-admin/dashboard-admin.component';
import { QuizComponent } from './pages/Quiz/quiz.component';
import { CreateQuizComponent } from './pages/create-quiz/create-quiz.component';
import { QuestionComponent } from './pages/questions/questions.component';
import { UpdateQuizComponent } from './pages/update-quiz/update-quiz.component';
import { CreateQuestionComponent } from './pages/create-question/create-question.component';
//import { UpdateQuestionComponent } from './pages/update-question/update-question.component';
import { StudentAnswersComponent } from './pages/student-answers/student-answers.component';
import { CreateStudentAnswerComponent } from './pages/create-student-answer/create-student-answer.component';
import { UpdateStudentAnswerComponent } from './pages/update-student-answer/update-student-answer.component';
import { FirstComponent } from './pages/first/first.component';
import { UpdateQuestionComponent } from './pages/update-question/update-question.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },

   // Route par défaut
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: InscriptionComponent },
  { path: 'dashboard', component: DashboardComponent },
 
  { path: 'layout', component: LayoutComponent },
  { path: 'dashboard-profile', component: DashboardProfileComponent },
  { path: 'dashboard-settings', component: DashboardSettingsComponent },
  { path: 'footer', component: FooterComponent },
  { path: 'courses', component: CoursesComponent },
  { path: 'quiz/:id', component: QuizComponent },
  { path: 'recover', component: RecoverComponent },
  { path: 'dashboard-admin', component: DashboardAdminComponent },
  { path: 'dashboard-admin/first', component: FirstComponent },

  { path: 'dashboard-admin/quiz', component: QuizComponent },
  // { path: 'quiz', component: QuizComponent },
  
  { path: 'create-question', component: CreateQuestionComponent },
  { path: 'create-quiz', component: CreateQuizComponent },
  { path: 'student-answers', component: StudentAnswersComponent },
  { path: 'create-student-answer', component: CreateStudentAnswerComponent },
  { path: 'update-student-answer/:id', component: UpdateStudentAnswerComponent },
  { path: 'questions', component: QuestionComponent },
  { path: '', redirectTo: '/questions', pathMatch: 'full' },
  { path: 'update-question/:id', component: UpdateQuestionComponent },
  
  { path: 'update-quiz/:id', component: UpdateQuizComponent }  
];
