/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

import { appConfig } from './app/app.config';  // Ensure correct path to appConfig
import { AppComponent } from './app/app.component';  // Ensure correct path to AppComponent


bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
