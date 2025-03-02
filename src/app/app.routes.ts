// app.routes.ts
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
import { AuthGuard } from './guards/auth.guard'; // Ajout du guard d'authentification
import { AdminProfileComponent } from './pages/admin-profile/admin-profile.component';
import { AllUsersComponent } from './pages/all-users/all-users.component';
import { AdminSettingsComponent } from './pages/admin-settings/admin-settings.component';
import { InterviewComponent } from './pages/interview/interview.component';
import { AllStudentsComponent } from './pages/all-students/all-students.component';
import { AllTeachersComponent } from './pages/all-teachers/all-teachers.component';

export const routes: Routes = [  // Make sure to export 'routes'
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: InscriptionComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'layout', component: LayoutComponent },
  { path: 'dashboard-profile', component: DashboardProfileComponent },
  { path: 'dashboard-settings', component: DashboardSettingsComponent },
  { path: 'footer', component: FooterComponent },
  { path: 'courses', component: CoursesComponent },
  { path: 'recover', component: RecoverComponent },
  { path: 'admin-profile', component: AdminProfileComponent },
  { path: 'all-users', component: AllUsersComponent },
  { path: 'admin-settings', component: AdminSettingsComponent },
  { path: 'interview', component: InterviewComponent },
  { path: 'all-students', component: AllStudentsComponent },
  { path: 'all-teachers', component: AllTeachersComponent },
  { path: 'dashboard-admin', component: DashboardAdminComponent }
];
