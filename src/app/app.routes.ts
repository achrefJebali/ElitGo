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

import { ClubsComponent } from './pages/clubs/clubs.component';
import { EventsComponent } from './pages/events/events.component';
import { AddEventComponent } from './pages/allevents/add-event.component';
import { ShoweventBACKComponent } from './pages/allevents/showevent-back/showevent-back.component';
import { AddClubComponent } from './pages/clubs/add-club/add-club.component';
import { ShowclubBackComponent } from './pages/clubs/showclub-back/showclub-back.component';



import { RecoverComponent } from './pages/recover/recover.component';
import { DashboardAdminComponent } from './pages/dashboard-admin/dashboard-admin.component';
import { FormationDisplayComponent } from './pages/Formation/formation-display/formation-display.component';
import { AddComponent } from './pages/Formation/add/add.component';
import { DetailsFormationComponent } from './pages/Formation/details-formation/details-formation.component';
import { DisplayBackComponent } from './pages/Formation/display-back/display-back.component';
import { CategoryListComponent } from './pages/Formation/category-list/category-list.component';
import { AddCategoryComponent } from './pages/Formation/add-category/add-category.component';
import { PaymentCancelComponent } from './pages/Formation/payment-cancel/payment-cancel.component';
import { PaymentSuccessComponent } from './pages/Formation/payment-success/payment-success.component';
import { FormationEditComponent } from './pages/Formation/formation-edit/formation-edit.component';
import { ProgressComponent } from './pages/Formation/progress/progress.component';
import { PurchasedFormationsComponent } from './pages/Formation/purchased-formations/purchased-formations.component';
import { StartFormationComponent } from './pages/Formation/startformation/startformation.component';
import { DisplayRessourceComponent } from './pages/Formation/display-ressource/display-ressource.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminProfileComponent } from './pages/admin-profile/admin-profile.component';
import { AllUsersComponent } from './pages/all-users/all-users.component';
import { AdminSettingsComponent } from './pages/admin-settings/admin-settings.component';
import { InterviewComponent } from './pages/interview/interview.component';
import { AllStudentsComponent } from './pages/all-students/all-students.component';
import { AllTeachersComponent } from './pages/all-teachers/all-teachers.component';
import { InterviewViewComponent } from './pages/interview-view/interview-view.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { Role } from './pages/models/user.model';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },

  { path: 'login', component: LoginComponent },
  { path: 'signup', component: InscriptionComponent },
  { path: 'recover', component: RecoverComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'layout', component: LayoutComponent },
  { path: 'dashboard-profile', component: DashboardProfileComponent },

  { path: 'dashboard-profile', component: DashboardProfileComponent },
  { path: 'dashboard-settings', component: DashboardSettingsComponent },
  { path: 'footer', component: FooterComponent },
  { path: 'courses', component: CoursesComponent },
  { path: 'events', component: EventsComponent},
  { path: 'clubs', component: ClubsComponent },
  { path: 'add-event', component: AddEventComponent },
  { path: 'showevent-back', component: ShoweventBACKComponent },
  { path: 'add-club', component: AddClubComponent },
  { path: 'showclub-back', component: ShowclubBackComponent }

  { path: 'dashboard-settings', component: DashboardSettingsComponent },
  { path: 'footer', component: FooterComponent },
  { path: 'courses', component: CoursesComponent },
  { path: 'recover', component: RecoverComponent },
  { path: 'dashboard-admin', component: DashboardAdminComponent },
  { path: 'formation-list', component: FormationDisplayComponent },
  { path: 'formation-add', component: AddComponent },
  { path: 'formations/:id', component: DetailsFormationComponent },
  { path: 'DisplayBack', component: DisplayBackComponent },
  { path: 'category-list', component: CategoryListComponent },
  { path: 'add-category', component: AddCategoryComponent },
  { path: 'payment-success', component: PaymentSuccessComponent },
  { path: 'payment-cancel', component: PaymentCancelComponent },
  { path: 'formation-edit/:id', component: FormationEditComponent },
  { path: 'progress', component: ProgressComponent },
  { path: 'purchased-formations', component: PurchasedFormationsComponent },
  { path: 'startformation/:id', component: StartFormationComponent },
  { path: 'ressourcelist', component: DisplayRessourceComponent },
  { path: '**', redirectTo: '' }
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
