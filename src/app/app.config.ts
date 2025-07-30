// app.config.ts
import { ApplicationConfig, importProvidersFrom, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http'; // AQUI

import { AuthInterceptor } from './auth/auth.interceptor';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(withEventReplay()), 
    provideAnimations(),
    // Mantenha apenas esta instância de provideHttpClient
    provideHttpClient(withInterceptors([AuthInterceptor]), withFetch()), 
    provideZonelessChangeDetection(), 
    importProvidersFrom([
      MatSnackBarModule,
      MatDialogModule
    ]), 
    // REMOVA ESTA SEGUNDA CHAMADA DUPLICADA: provideHttpClient(), 
    provideTransloco({
        config: { 
          availableLangs: ['en', 'es', 'pt'],
          defaultLang: 'pt',
          reRenderOnLangChange: true,
          prodMode: !isDevMode(),
          // Se quiser um fallback explícito caso uma chave não seja encontrada na linguagem ativa
          // fallbackLang: 'pt' 
        },
        loader: TranslocoHttpLoader
      })
  ]
};