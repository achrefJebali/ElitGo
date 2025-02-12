// app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { InscriptionComponent } from './pages/inscription/inscription.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { EventsComponent } from './pages/events/events.component';



export const routes: Routes = [  // Make sure to export 'routes'
  { path: '', component: HomeComponent }, // Default route
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: InscriptionComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'layout', component: LayoutComponent },
  { path: 'events', component: EventsComponent},


];
