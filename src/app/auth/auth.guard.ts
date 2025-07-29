import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    console.log('AuthGuard: Checking if user can activate route:', state.url);
    
    // First check synchronously
    const isLoggedInSync = this.authService.isLoggedInSync();
    console.log('AuthGuard: Synchronous login check:', isLoggedInSync);
    
    if (isLoggedInSync) {
      console.log('AuthGuard: User is logged in, allowing access');
      return true;
    }

    // If not logged in synchronously, check the observable
    return this.authService.isLoggedIn().pipe(
      take(1), // Pega o primeiro valor e completa o observable
      map(isLoggedIn => {
        console.log('AuthGuard: Observable login check:', isLoggedIn);
        if (isLoggedIn) {
          console.log('AuthGuard: User is logged in, allowing access');
          return true; // Usuário logado, permite acesso
        } else {
          // Usuário não logado, exibe mensagem e redireciona para o login
          console.log('AuthGuard: User not logged in, redirecting to login');
          this.snackBar.open('Você precisa estar logado para acessar esta página.', 'Fechar', { duration: 3000 });
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}