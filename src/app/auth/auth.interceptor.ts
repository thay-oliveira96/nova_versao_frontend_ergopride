import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from './auth.service'; // Certifique-se de que o caminho está correto
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isPlatformBrowser } from '@angular/common';
import { catchError, switchMap, filter, take, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject, Observable } from 'rxjs';

// Variável de controle para evitar múltiplas requisições de refresh simultâneas
let isRefreshing = false;
// Subject para guardar requisições pendentes enquanto o token é refrescado
let refreshTokenSubject: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);

export function AuthInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const platformId = inject(PLATFORM_ID);

  // Pega o access token atual
  const accessToken = authService.getAccessToken();

  // Se o access token existe, clona a requisição e adiciona o cabeçalho de Autorização
  if (accessToken) {
    request = addTokenHeader(request, accessToken);
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se for um erro 401 Unauthorized, e não for a rota de login
      if (error.status === 401 && !request.url.includes('/auth/signin')) {
        // Se a requisição atual falhou por 401 e o refresh não está em andamento
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null); // Limpa o subject para novas notificações

          const username = authService.getUsernameFromAccessToken();
          const currentRefreshToken = authService.getRefreshToken();

          if (username && currentRefreshToken) {
            console.log('AuthInterceptor: Token expirado, tentando refresh...');
            return authService.requestRefreshToken(username, currentRefreshToken).pipe(
              switchMap((response: any) => {
                isRefreshing = false;
                const newAccessToken = response.acessToken; // Assume que a resposta de refresh tem 'acessToken'
                refreshTokenSubject.next(newAccessToken); // Notifica com o novo token
                console.log('AuthInterceptor: Token refrescado com sucesso. Re-tentando requisição original.');
                return next(addTokenHeader(request, newAccessToken)); // Re-tenta a requisição original com o novo token
              }),
              catchError((errRefresh) => {
                isRefreshing = false;
                console.error('AuthInterceptor: Falha ao refrescar token, deslogando...', errRefresh);
                authService.logout();
                if (isPlatformBrowser(platformId)) {
                  snackBar.open('Sessão expirada ou não autorizada. Faça login novamente.', 'Fechar', { duration: 5000 });
                  router.navigate(['/login']);
                }
                return throwError(() => errRefresh); // Re-lança o erro de refresh
              })
            );
          } else {
            console.warn('AuthInterceptor: Refresh token ou username não encontrado. Deslogando.');
            authService.logout();
            if (isPlatformBrowser(platformId)) {
              snackBar.open('Sessão expirada. Faça login novamente.', 'Fechar', { duration: 5000 });
              router.navigate(['/login']);
            }
            return throwError(() => error); // Não há refresh token, re-lança o erro original
          }
        } else {
          // Se o refresh já está em andamento, espera pelo novo token
          console.log('AuthInterceptor: Refresh já em andamento, aguardando novo token...');
          return refreshTokenSubject.pipe(
            filter(token => token !== null), // Espera até que um novo token seja emitido
            take(1), // Pega apenas o primeiro novo token
            switchMap(token => {
              console.log('AuthInterceptor: Novo token recebido, re-tentando requisição...');
              return next(addTokenHeader(request, token)); // Re-tenta a requisição com o novo token
            })
          );
        }
      }

      // Para outros erros ou se não for 401
      return throwError(() => error);
    })
  );
}

// Função auxiliar para adicionar o cabeçalho de autorização
function addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}
