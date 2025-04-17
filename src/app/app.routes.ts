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
  { path: 'events', component: EventsComponent},
  { path: 'clubs', component: ClubsComponent },
  { path: 'add-event', component: AddEventComponent },
  { path: 'showevent-back', component: ShoweventBACKComponent },
  { path: 'add-club', component: AddClubComponent },
  { path: 'showclub-back', component: ShowclubBackComponent }
];
