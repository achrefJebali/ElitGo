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

import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient()
  ]
};
import { provideHttpClient } from '@angular/common/http'; 
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),  
    provideHttpClient(),   
    JwtHelperService,         
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },  
    BrowserAnimationsModule // Add this to provide BrowserAnimationsModule
  ]

};
