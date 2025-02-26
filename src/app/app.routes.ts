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

import { AnnoncementComponent } from './pages/annoncement/annoncement.component';
import { BlogsComponent } from './pages/blogs/blogs.component';
import { CommentComponent } from './pages/comment/comment.component';




import { RecoverComponent } from './pages/recover/recover.component';
import { DashboardAdminComponent } from './pages/dashboard-admin/dashboard-admin.component';
import { NotificationComponent } from './pages/notification/notification.component';
import { DashboardAnnoncementComponent } from './pages/dashboard-annoncement/dashboard-annoncement.component';
import { DashboardNotifComponent } from './pages/dashboard-notif/dashboard-notif.component';
import { FeedbackComponent } from './pages/feedback/feedback.component';




export const routes: Routes = [  // Make sure to export 'routes'
  { path: '', component: HomeComponent }, // Default route
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: InscriptionComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'layout', component: LayoutComponent },

  { path: 'dashboard-profile', component: DashboardProfileComponent },
  { path: 'dashboard-profile', component: DashboardProfileComponent },
  { path: 'dashboard-settings', component: DashboardSettingsComponent },
  { path: 'footer', component: FooterComponent },
  { path: 'courses', component: CoursesComponent },

  { path: 'annoncement', component: AnnoncementComponent },
  { path: 'blogs', component: BlogsComponent }, 
  { path: 'comment', component: CommentComponent },
  



  { path: 'recover', component: RecoverComponent },
  { path: 'dashboard-admin', component: DashboardAdminComponent },

  { path: 'notification', component: NotificationComponent },

  { path: 'dashboardAnnoncement', component: DashboardAnnoncementComponent },

  { path: 'dashboardNotif', component: DashboardNotifComponent },
  { path: 'feedback', component: FeedbackComponent },
  


];
