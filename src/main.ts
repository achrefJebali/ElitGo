import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';  // Ensure correct path to appConfig
import { AppComponent } from './app/app.component';  // Ensure correct path to AppComponent

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
