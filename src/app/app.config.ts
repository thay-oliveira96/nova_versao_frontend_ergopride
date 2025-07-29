import { ApplicationConfig, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { AuthInterceptor } from './auth/auth.interceptor';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // A propriedade `withEventReplay()` é uma feature de hidratação no Angular 20 e
    // é passada para `provideClientHydration`.
    provideClientHydration(withEventReplay()), 
    provideAnimations(),
    // Configura o HttpClient com interceptores e fetch API
    provideHttpClient(withInterceptors([AuthInterceptor]), withFetch()),
    // Provedor para detecção de mudanças zoneless (sem Zone.js)
    provideZonelessChangeDetection(), 
    // Importa módulos do Angular Material para uso em componentes standalone
    importProvidersFrom([
      MatSnackBarModule,
      MatDialogModule
    ])
  ]
};