// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';
import { authInterceptor } from '../app/core/auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Routing
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions()
    ),

    // HTTP Client with interceptors
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),

    // Animations
    provideAnimations(),

    // Toastr notifications
    provideToastr({
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      timeOut: 30000,
      closeButton: true,
      progressBar: true,
      newestOnTop: true
    })
  ]
};
