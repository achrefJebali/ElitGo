import { ApplicationConfig } from '@angular/core';
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
