import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ReactiveFormsModule, FormControl } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { environment } from '../../environments/environments';
import { NgxCaptchaModule } from 'ngx-captcha';
import { MatRadioModule } from '@angular/material/radio'; 
import { Subscription } from 'rxjs';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (!password || !confirmPassword) {
    return null;
  }

  return password.value === confirmPassword.value ? null : { 'passwordMismatch': true };
};

@Component({
  selector: 'app-public-registration',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatCardModule,
    MatButtonModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxCaptchaModule,
    MatRadioModule 
  ],
  templateUrl: './public-registration.html',
  styleUrl: './public-registration.scss'
})
export class PublicRegistration implements OnInit, OnDestroy {
  private readonly baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  public siteKey: string = '6Le0Ha0rAAAAADvAYGPKbhnjVG7BQjdhimO0Sgpl';
  public registrationType: 'pf' | 'pj' | null = null;
  
  public registrationTypeControl = new FormControl<'pf' | 'pj' | null>(null, Validators.required);
  private stepperSubscription!: Subscription;

  pfInfoForm!: FormGroup;
  pjInfoForm!: FormGroup;
  addressForm!: FormGroup;
  passwordForm!: FormGroup;

  hidePassword = true;
  hideConfirmPassword = true;

  ngOnInit(): void {
    this.pfInfoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      sobrenome: ['', [Validators.required, Validators.maxLength(100)]],
      cpf: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      dataNascimento: ['', [Validators.required]],
      telefone: ['', [Validators.pattern(/^\d{10,11}$/)]],
      celular: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]]
    });

    this.pjInfoForm = this.fb.group({
      razaoSocial: ['', [Validators.required, Validators.maxLength(200)]],
      nomeFantasia: ['', [Validators.required, Validators.maxLength(200)]],
      cnpj: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
      inscricaoEstadual: [''],
      inscricaoMunicipal: [''],
      telefone1: ['', [Validators.pattern(/^\d{10,11}$/)]],
      celular: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]]
    });

    this.addressForm = this.fb.group({
      logradouro: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      complemento: [''],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      cep: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]]
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      recaptcha: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  onSubmit(): void {
    let finalPayload: any;
    let endpoint: string = '';
    let emailToValidate: string = '';
    let cpfCnpjToValidate: string = '';
    let tipoPessoaToValidate: string = '';
    
    if (this.registrationType === 'pf' && this.pfInfoForm.valid && this.addressForm.valid && this.passwordForm.valid) {
      finalPayload = {
        ...this.pfInfoForm.value,
        endereco: this.addressForm.value,
        senha: this.passwordForm.get('password')?.value,
        recaptchaToken: this.passwordForm.get('recaptcha')?.value
      };
      
      if (finalPayload.dataNascimento instanceof Date) {
        finalPayload.dataNascimento = finalPayload.dataNascimento.toISOString().split('T')[0];
      }
      
      endpoint = `${this.baseUrl}/api/v1/publica/pessoa-fisica/cadastrar`;
      emailToValidate = finalPayload.email;
      cpfCnpjToValidate = finalPayload.cpf;
      tipoPessoaToValidate = 'F';
      
    } else if (this.registrationType === 'pj' && this.pjInfoForm.valid && this.addressForm.valid && this.passwordForm.valid) {
      finalPayload = {
        ...this.pjInfoForm.value,
        endereco: this.addressForm.value,
        senha: this.passwordForm.get('password')?.value,
        recaptchaToken: this.passwordForm.get('recaptcha')?.value
      };
      
      endpoint = `${this.baseUrl}/api/v1/publica/pessoa-juridica/cadastrar`;
      emailToValidate = finalPayload.email;
      cpfCnpjToValidate = finalPayload.cnpj;
      tipoPessoaToValidate = 'J';

    } else {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios e valide o reCAPTCHA.', 'Fechar', { duration: 5000 });
      return;
    }
    
    console.log('Payload a ser enviado:', finalPayload);

    this.http.post(endpoint, finalPayload)
      .subscribe({
        next: () => {
          this.snackBar.open('Cadastro realizado com sucesso. Verifique seu e-mail para validar a conta.', 'Fechar', { duration: 5000 });
          this.router.navigate(['/validate-registration'], {
            queryParams: {
              email: emailToValidate,
              cpfCnpj: cpfCnpjToValidate,
              tipoPessoa: tipoPessoaToValidate,
            }
          });
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erro no cadastro:', error);
          let errorMessage = 'Erro ao realizar o cadastro. Tente novamente.';
          if (error.status === 409) {
            errorMessage = 'Este CPF/CNPJ ou e-mail já está em uso.';
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.snackBar.open(errorMessage, 'Fechar', { duration: 5000, panelClass: ['snackbar-error'] });
        }
      });
  }

  ngOnDestroy(): void {
    if (this.stepperSubscription) {
      this.stepperSubscription.unsubscribe();
    }
  }
}