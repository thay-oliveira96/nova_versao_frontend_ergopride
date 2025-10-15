import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.loading = true;
      }, 0);
      
      const { username, password } = this.loginForm.value;
      this.authService.login({ username, password }).subscribe({
        next: (response) => {
          this.loading = false;
        },
        error: (err) => {
          console.error('LoginComponent: Login error:', err);
          let errorMessage = 'Falha no login. Verifique suas credenciais.';
          if (err.error && err.error.message) {
            errorMessage = err.error.message;
          } else if (err.status === 401) {
            errorMessage = 'Credenciais inválidas.';
          } else if (err.status === 0) {
            errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
          }
          this.snackBar.open(errorMessage, 'Fechar', { duration: 5000, panelClass: ['snackbar-error'] });
          this.loading = false;
        }
      });
    } else {
      this.snackBar.open('Preencha usuário e senha.', 'Fechar', { duration: 3000, panelClass: ['snackbar-warning'] });
    }
  }
}
