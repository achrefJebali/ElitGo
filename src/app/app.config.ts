import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http'; // <-- Import HttpClient
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),  // Your routing configuration
    provideHttpClient(),   
    JwtHelperService,          // ✅ Provide JwtHelperService
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS }  // Add this to provide HttpClient globally
  ]
};
