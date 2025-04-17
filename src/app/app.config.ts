import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { EventsService } from './services/events.service';
import { FormsModule } from '@angular/forms';
import { AddEventComponent } from './pages/allevents/add-event.component';
 // Ton composant AddEventComponent


export const appConfig: ApplicationConfig = {
  providers: [
    // Configuration des routes et services
    provideRouter(routes), 
    provideHttpClient(), 
    EventsService,
    FormsModule,
    
    AddEventComponent,
      // Déclaration du service
  ],
};
