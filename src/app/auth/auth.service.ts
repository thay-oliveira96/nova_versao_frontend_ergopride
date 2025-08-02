import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of, Subscription } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environments';

export interface AuthResponse {
  acessToken: string;
  refreshToken: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly baseUrl = environment.apiUrl;
  private readonly platformId = inject(PLATFORM_ID);
  
  // Sujeito para o status de login
  private loggedIn = new BehaviorSubject<boolean>(false);
  
  // NOVO: Sujeito para a role do usuário, começa como nulo
  private userRoleSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loggedIn.next(this.hasAccessToken());
      const initialRole = this.getRoleFromToken();
      this.userRoleSubject.next(initialRole);
    }
  }
  
  public isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  // NOVO: Exponho a role do usuário como um Observable
  public getUserRole(): Observable<string | null> {
    return this.userRoleSubject.asObservable();
  }

  // AQUI: CORRIGIDO para ler o array "roles" do token e pegar o primeiro item
  private getRoleFromToken(): string | null {
    const token = this.getAccessToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // AQUI: Lê o campo 'roles' (no plural) e verifica se é um array com itens.
        // Se sim, retorna o primeiro item. Se não, retorna null.
        return (decoded.roles && Array.isArray(decoded.roles) && decoded.roles.length > 0) ? decoded.roles[0] : null;
      } catch (e) {
        console.error('Erro ao decodificar token para obter a role:', e);
        return null;
      }
    }
    return null;
  }
  
  // NOVO: Método para obter o username do token, necessário para o interceptor
  public getUsernameFromAccessToken(): string | null {
    const token = this.getAccessToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded.sub || null; // O subject 'sub' geralmente é o username
      } catch (e) {
        console.error('Erro ao decodificar token para obter o username:', e);
        return null;
      }
    }
    return null;
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/signin`, credentials).pipe(
      tap(response => {
        const accessToken = response.acessToken;
        const refreshToken = response.refreshToken;
        if (accessToken && refreshToken) {
          this.saveAccessToken(accessToken);
          this.saveRefreshToken(refreshToken);
          this.loggedIn.next(true);

          // NOVO: Emite a nova role do usuário para todos os inscritos
          const userRole = this.getRoleFromToken();
          this.userRoleSubject.next(userRole);
          console.log(`AuthService: Usuário logado com a role: ${userRole}`);
          
          this.router.navigate(['/home']).then(() => {
            this.snackBar.open('Login realizado com sucesso!', 'Fechar', { duration: 3000 });
          });
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocorreu um erro no login. Por favor, tente novamente.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        this.snackBar.open(errorMessage, 'Fechar', { duration: 5000, panelClass: ['snackbar-error'] });
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  
  // NOVO: Método para fazer a requisição do refresh token
  public requestRefreshToken(username: string, refreshToken: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/refresh`, { username, refreshToken });
  }

  // Limpa o estado de autenticação
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.loggedIn.next(false);
    this.userRoleSubject.next(null); // NOVO: Notifica que a role foi removida
    this.router.navigate(['/login']);
    this.snackBar.open('Logout realizado.', 'Fechar', { duration: 3000 });
  }

  // Verificações de permissão (agora usam o valor do BehaviorSubject)
  public isApprover(): boolean {
    return this.userRoleSubject.value === 'APPROVER';
  }

  public isAdministrator(): boolean {
    return this.userRoleSubject.value === 'ADMINISTRATOR';
  }

  public isTechnical(): boolean {
    return this.userRoleSubject.value === 'TECHNICAL';
  }

  // Métodos síncronos para obter tokens, usados no interceptor e no guard
  public getAccessToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }
  
  public getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }
  
  public saveAccessToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private saveRefreshToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  public hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }
}