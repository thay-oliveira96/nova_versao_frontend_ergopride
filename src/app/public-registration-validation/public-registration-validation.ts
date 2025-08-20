import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../environments/environments';

@Component({
  selector: 'app-public-registration-validation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './public-registration-validation.html',
  styleUrl: './public-registration-validation.scss'
})
export class PublicRegistrationValidationComponent implements OnInit {
  private readonly baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  validationForm!: FormGroup;
  maskedEmail: string = '';
  private email: string = '';
  private cpf: string = '';

  ngOnInit(): void {
    // Inicializa o formulário com um campo para o código de validação
    this.validationForm = this.fb.group({
      codigoValidacao: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    // Pega os parâmetros da URL para obter o email e cpf
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.cpf = params['cpf'] || '';
      this.maskedEmail = this.maskEmail(this.email);
    });
  }

  // Máscara o e-mail para exibição
  maskEmail(email: string): string {
    if (!email) {
      return '';
    }
    const [localPart, domainPart] = email.split('@');
    if (!localPart || !domainPart) {
      return email;
    }

    const maskedLocalPart = localPart.length > 3
      ? localPart.substring(0, 2) + '*'.repeat(localPart.length - 2)
      : localPart;

    const [domain, tld] = domainPart.split('.');
    const maskedDomain = domain.length > 3
      ? domain.charAt(0) + '*'.repeat(domain.length - 2) + domain.slice(-1)
      : domain;
      
    return `${maskedLocalPart}@${maskedDomain}.${tld}`;
  }

  // Método para enviar a requisição de validação
  onSubmit(): void {
    if (this.validationForm.invalid) {
      this.snackBar.open('Por favor, insira o código de 6 dígitos.', 'Fechar', { duration: 5000 });
      return;
    }

    const payload = {
      codigoValidacao: this.validationForm.get('codigoValidacao')?.value,
      emailValidado: this.email,
      cpf: this.cpf
    };

    console.log('Payload de validação:', payload);

    this.http.post(`${this.baseUrl}/api/v1/publica/valida-cliente/pessoa-fisica`, payload)
      .subscribe({
        next: () => {
          this.snackBar.open('Conta validada com sucesso! Você já pode fazer login.', 'Fechar', { duration: 5000 });
          this.router.navigate(['/login']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erro na validação do código:', error);
          let errorMessage = 'Código de validação inválido. Tente novamente.';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.snackBar.open(errorMessage, 'Fechar', { duration: 5000, panelClass: ['snackbar-error'] });
        }
      });
  }
}