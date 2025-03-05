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
import { FormationDisplayComponent } from './pages/Formation/formation-display/formation-display.component';
import { AddComponent } from './pages/Formation/add/add.component';
import { DetailsFormationComponent } from './pages/Formation/details-formation/details-formation.component';
import { DisplayBackComponent } from './pages/Formation/display-back/display-back.component';
import { CategoryListComponent } from './pages/Formation/category-list/category-list.component';
import { AddCategoryComponent } from './pages/Formation/add-category/add-category.component';
import { PaymentCancelComponent } from './pages/Formation/payment-cancel/payment-cancel.component';
import { PaymentSuccessComponent } from './pages/Formation/payment-success/payment-success.component';
import { FormationEditComponent } from './pages/Formation/formation-edit/formation-edit.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: InscriptionComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'layout', component: LayoutComponent },
  { path: 'dashboard-profile', component: DashboardProfileComponent },
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
  {
    path: 'formation-edit/:id',
    component: FormationEditComponent
  },
  { path: '**', redirectTo: '' }
];
