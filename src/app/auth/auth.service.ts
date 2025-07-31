import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isPlatformBrowser } from '@angular/common';

import { jwtDecode } from 'jwt-decode'; // Certifique-se de que está instalado: npm install jwt-decode
import { environment } from '../../environments/environments'; // <<-- CORRIGIDO: Removido o 's' extra em 'environments'

interface AuthResponse {
  username?: string;
  authenticated?: boolean;
  created?: string;
  expiration?: string;
  acessToken?: string; // Corrigido para corresponder à sua API (um 'c' em 'acess')
  refreshToken?: string;
  [key: string]: any; // Permite outras propriedades
}

// A resposta do refresh token deve conter o novo access token
interface RefreshResponse {
  acessToken: string; // Esperamos que o novo access token venha com esta propriedade
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  // REMOVIDO: URLs fixas, agora usamos baseUrl
  // private loginUrl = 'http://localhost:8080/auth/signin';
  // private refreshUrl = 'http://localhost:8080/auth/refresh'; 
  private TOKEN_KEY = 'jwt_token'; // Para o access token
  private REFRESH_TOKEN_KEY = 'jwt_refresh_token'; // Para o refresh token
  private platformId = inject(PLATFORM_ID);

  private loggedIn = new BehaviorSubject<boolean>(false);
  // BehaviorSubject para notificar sobre o novo access token após o refresh
  // Usado pelo interceptor para re-tentar requisições
  private newAccessTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loggedIn.next(this.hasAccessToken());
    }
  }

  // Verifica se existe um access token válido
  private hasAccessToken(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token && !this.isTokenExpired(token);
  }

  login(credentials: any): Observable<AuthResponse> {
    console.log('AuthService: Iniciando processo de login');
    // USANDO baseUrl PARA CONSTRUIR A URL DE LOGIN
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/signin`, credentials).pipe(
      tap(response => {
        console.log('AuthService: Resposta de login recebida:', response);

        const accessToken = response.acessToken; // Extrai o access token
        const refreshToken = response.refreshToken; // Extrai o refresh token

        if (accessToken && refreshToken) {
          console.log('AuthService: Tokens recebidos, salvando e atualizando estado');
          this.saveAccessToken(accessToken);
          this.saveRefreshToken(refreshToken); // Salva o refresh token
          this.loggedIn.next(true);
          this.router.navigate(['/home']).then(() => {
            this.snackBar.open('Login realizado com sucesso!', 'Fechar', { duration: 3000 });
          }).catch(err => {
            console.error('AuthService: Falha na navegação após login:', err);
          });
        } else {
          console.error('AuthService: Nenhum access ou refresh token encontrado na resposta');
          this.snackBar.open('Resposta inválida do servidor. Tokens não encontrados.', 'Fechar', { duration: 5000 });
        }
      }),
      catchError(error => {
        console.error('AuthService: Erro durante o login:', error);
        this.loggedIn.next(false);
        // Não exibe o snackbar aqui, o componente de login já lida com isso.
        return throwError(() => error);
      })
    );
  }

  // NOVO: Método para fazer a requisição de refresh token
  // O interceptor irá chamar este método
  requestRefreshToken(username: string, currentRefreshToken: string): Observable<RefreshResponse> {
    console.log(`AuthService: Solicitando refresh token para o usuário: ${username}`);
    // Adiciona o refresh token no cabeçalho Authorization, conforme sua API
    const headers = {
        'Authorization': `Bearer ${currentRefreshToken}`
    };
    // USANDO baseUrl PARA CONSTRUIR A URL DE REFRESH
    return this.http.put<RefreshResponse>(`${this.baseUrl}/auth/refresh/${username}`, {}, { headers }).pipe(
      tap(response => {
        console.log('AuthService: Resposta de refresh token recebida:', response);
        const newAccessToken = response.acessToken; // Espera o novo access token

        if (newAccessToken) {
          this.saveAccessToken(newAccessToken);
          this.newAccessTokenSubject.next(newAccessToken); // Notifica o novo token
          console.log('AuthService: Novo access token salvo.');
        } else {
          console.error('AuthService: Nenhum novo access token na resposta de refresh.');
          throw new Error('Nenhum novo access token na resposta de refresh.');
        }
      }),
      catchError(error => {
        console.error('AuthService: Erro ao solicitar refresh token:', error);
        this.logout(); // Logout automático se o refresh falhar
        this.newAccessTokenSubject.next(null); // Limpa o subject em caso de erro
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    console.log('AuthService: Realizando logout');
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY); // Remove o refresh token também
    }
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
    this.snackBar.open('Logout realizado.', 'Fechar', { duration: 3000 });
  }

  saveAccessToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  saveRefreshToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  getAccessToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // NOVO: Método para obter o username do token decodificado
  getUsernameFromAccessToken(): string | null {
    const token = this.getAccessToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded.sub || null; // 'sub' é geralmente o campo para o sujeito/username
      } catch (e) {
        console.error('Erro ao decodificar token para obter username:', e);
        return null;
      }
    }
    return null;
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  isLoggedInSync(): boolean {
    return this.loggedIn.value;
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp === undefined) {
        return false;
      }
      const date = new Date(0);
      date.setUTCSeconds(decoded.exp);
      return !(date.valueOf() > new Date().valueOf());
    } catch (e) {
      console.error('Erro ao decodificar token ou token inválido:', e);
      return true;
    }
  }

  // NOVO: Retorna o Subject para que o interceptor possa se inscrever
  onNewAccessToken(): Observable<string | null> {
    return this.newAccessTokenSubject.asObservable();
  }
}