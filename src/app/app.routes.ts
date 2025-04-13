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
import { AuthGuard } from './guards/auth.guard';
import { AdminProfileComponent } from './pages/admin-profile/admin-profile.component';
import { AllUsersComponent } from './pages/all-users/all-users.component';
import { AdminSettingsComponent } from './pages/admin-settings/admin-settings.component';
import { InterviewComponent } from './pages/interview/interview.component';
import { AllStudentsComponent } from './pages/all-students/all-students.component';
import { AllTeachersComponent } from './pages/all-teachers/all-teachers.component';
import { InterviewViewComponent } from './pages/interview-view/interview-view.component';
import { Role } from './pages/models/user.model';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: InscriptionComponent },
  { path: 'recover', component: RecoverComponent },
  { path: 'layout', component: LayoutComponent },
  { path: 'footer', component: FooterComponent },
  
  // Protected User Routes
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.STUDENT, Role.TEACHER] }
  },
  { 
    path: 'dashboard-profile', 
    component: DashboardProfileComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.STUDENT, Role.TEACHER] }
  },
  { 
    path: 'dashboard-settings', 
    component: DashboardSettingsComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.STUDENT, Role.TEACHER] }
  },
  { 
    path: 'courses', 
    component: CoursesComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.STUDENT, Role.TEACHER] }
  },
  { 
    path: 'interview', 
    component: InterviewComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.ADMIN] }
  },
  { 
    path: 'my-interviews', 
    component: InterviewViewComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.STUDENT, Role.TEACHER] }
  },

  // Protected Admin Routes
  { 
    path: 'dashboard-admin', 
    component: DashboardAdminComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.ADMIN] }
  },
  { 
    path: 'admin-profile', 
    component: AdminProfileComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.ADMIN] }
  },
  { 
    path: 'admin-settings', 
    component: AdminSettingsComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.ADMIN] }
  },
  { 
    path: 'all-users', 
    component: AllUsersComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.ADMIN] }
  },
  { 
    path: 'all-students', 
    component: AllStudentsComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.ADMIN] }
  },
  { 
    path: 'all-teachers', 
    component: AllTeachersComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.ADMIN] }
  },
 

  // Wildcard route for 404
  { path: '**', redirectTo: '/home' }
];
