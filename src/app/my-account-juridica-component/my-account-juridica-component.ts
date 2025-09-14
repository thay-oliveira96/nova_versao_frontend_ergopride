import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { environment } from '../../environments/environments';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

// Interfaces para os dados da API
interface EnderecoPublicoResponseDTO {
  id: number;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

interface PessoaJuridicaPublicaReponseDTO {
  id: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstatual: string;
  inscricaoMunicipal: string;
  endereco: EnderecoPublicoResponseDTO;
  telefone: string;
  celular: string;
  email: string;
}

interface PessoaJuridicaDTO {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstatual: string;
  inscricaoMunicipal: string;
  endereco: EnderecoPublicoResponseDTO;
  telefone1: string;
  celular: string;
  email: string;
  senha?: string;
}

interface AlterarSenhaDTO {
  idPessoa: number;
  senhaAtual: string;
  novaSenha: string;
  confirmacaoNovaSenha: string;
}

@Component({
  selector: 'app-my-account-juridica',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule
  ],
  templateUrl: './my-account-juridica-component.html',
  styleUrl: './my-account-juridica-component.scss'
})
export class MyAccountJuridicaComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private readonly baseUrl = environment.apiUrl;

  tipoPessoa: string | null = null;
  userRole: string | null = null;
  private tipoPessoaSubscription!: Subscription;
  private userRoleSubscription!: Subscription;

  cadastralForm!: FormGroup;
  passwordForm!: FormGroup;
  isEditMode = false;
  showPasswordForm = false;
  userId: number | null = null;

  userProfile = {
    razaoSocial: 'Carregando...',
    nomeFantasia: 'Carregando...',
    cnpj: 'Carregando...',
    inscricaoEstatual: 'Carregando...',
    inscricaoMunicipal: 'Carregando...',
    telefone: 'Carregando...',
    celular: 'Carregando...',
    email: 'Carregando...',
    logradouro: 'Carregando...',
    numero: 'Carregando...',
    complemento: 'Carregando...',
    bairro: 'Carregando...',
    cidade: 'Carregando...',
    estado: 'Carregando...',
    cep: 'Carregando...'
  };

  planDetails = {
    planoAtual: 'Plano Premium',
    valor: 49.90,
    ciclo: 'Mensal',
    proximaRenovacao: '25/08/2026'
  };

  linkedUsers = [
    { nome: 'Maria Silva', email: 'maria.silva@exemplo.com', status: 'Ativo' },
    { nome: 'Pedro Souza', email: 'pedro.souza@exemplo.com', status: 'Inativo' }
  ];

  constructor(
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.cadastralForm = this.fb.group({
      razaoSocial: [{ value: '', disabled: true }, Validators.required],
      nomeFantasia: [{ value: '', disabled: true }, Validators.required],
      cnpj: [{ value: '', disabled: true }, Validators.required],
      inscricaoEstatual: [{ value: '', disabled: true }],
      inscricaoMunicipal: [{ value: '', disabled: true }],
      telefone: [{ value: '', disabled: true }],
      celular: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      logradouro: [{ value: '', disabled: true }, Validators.required],
      numero: [{ value: '', disabled: true }, Validators.required],
      complemento: [{ value: '', disabled: true }],
      bairro: [{ value: '', disabled: true }, Validators.required],
      cidade: [{ value: '', disabled: true }, Validators.required],
      estado: [{ value: '', disabled: true }, Validators.required],
      cep: [{ value: '', disabled: true }, Validators.required]
    });

    // Inicializa o formulário de troca de senha
    this.passwordForm = this.fb.group({
      senhaAtual: ['', Validators.required],
      novaSenha: ['', [Validators.required, Validators.minLength(8)]],
      confirmacaoNovaSenha: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // Inscreve-se para o tipo de pessoa e busca os dados se for Pessoa Jurídica
    this.tipoPessoaSubscription = this.authService.getTipoPessoa().subscribe(tipoPessoa => {
      this.tipoPessoa = tipoPessoa;
      if (tipoPessoa === 'J') {
        this.loadPessoaJuridicaData();
      }
    });

    // Inscreve-se para a role do usuário
    this.userRoleSubscription = this.authService.getUserRole().subscribe(role => {
      this.userRole = role;
    });
  }

  ngOnDestroy(): void {
    if (this.tipoPessoaSubscription) {
      this.tipoPessoaSubscription.unsubscribe();
    }
    if (this.userRoleSubscription) {
      this.userRoleSubscription.unsubscribe();
    }
  }

  private loadPessoaJuridicaData(): void {
    const email = this.authService.getUsernameFromAccessToken();
    if (email) {
      const url = `${this.baseUrl}/api/v1/pessoa-juridica/buscar/email/${email}`;
      this.http.get<PessoaJuridicaPublicaReponseDTO>(url).subscribe({
        next: (data) => {
          console.log('Dados de Pessoa Jurídica recebidos:', data);
          this.userId = data.id;
          this.userProfile.razaoSocial = data.razaoSocial;
          this.userProfile.nomeFantasia = data.nomeFantasia;
          this.userProfile.cnpj = data.cnpj;
          this.userProfile.inscricaoEstatual = data.inscricaoEstatual;
          this.userProfile.inscricaoMunicipal = data.inscricaoMunicipal;
          this.userProfile.email = data.email;
          this.userProfile.telefone = data.telefone;
          this.userProfile.celular = data.celular;
          if (data.endereco) {
            this.userProfile.logradouro = data.endereco.logradouro;
            this.userProfile.numero = data.endereco.numero;
            this.userProfile.complemento = data.endereco.complemento;
            this.userProfile.bairro = data.endereco.bairro;
            this.userProfile.cidade = data.endereco.cidade;
            this.userProfile.estado = data.endereco.estado;
            this.userProfile.cep = data.endereco.cep;
          }
          
          this.cadastralForm.patchValue({
            razaoSocial: this.userProfile.razaoSocial,
            nomeFantasia: this.userProfile.nomeFantasia,
            cnpj: this.userProfile.cnpj,
            inscricaoEstatual: this.userProfile.inscricaoEstatual,
            inscricaoMunicipal: this.userProfile.inscricaoMunicipal,
            telefone: this.userProfile.telefone,
            celular: this.userProfile.celular,
            email: this.userProfile.email,
            logradouro: this.userProfile.logradouro,
            numero: this.userProfile.numero,
            complemento: this.userProfile.complemento,
            bairro: this.userProfile.bairro,
            cidade: this.userProfile.cidade,
            estado: this.userProfile.estado,
            cep: this.userProfile.cep
          });
        },
        error: (err) => {
          console.error('Erro ao buscar dados de Pessoa Jurídica:', err);
          this.snackBar.open('Erro ao carregar dados da conta.', 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  // Validador personalizado para verificar se as senhas coincidem
  private passwordMatchValidator(form: FormGroup) {
    const novaSenha = form.get('novaSenha')?.value;
    const confirmacaoNovaSenha = form.get('confirmacaoNovaSenha')?.value;
    return novaSenha === confirmacaoNovaSenha ? null : { mismatch: true };
  }

  // Métodos de verificação de role e tipo de pessoa
  isManager(): boolean {
    return this.userRole === 'MANAGER';
  }

  isApprover(): boolean {
    return this.userRole === 'APPROVER';
  }

  isTechnical(): boolean {
    return this.userRole === 'TECHNICAL';
  }
  
  isPessoaJuridica(): boolean {
    return this.tipoPessoa === 'J';
  }

  onEditProfile(): void {
    this.isEditMode = true;
    Object.keys(this.cadastralForm.controls).forEach(key => {
      if (key !== 'email' && key !== 'cnpj') {
        this.cadastralForm.get(key)?.enable();
      }
    });
  }

  onSaveChanges(): void {
    if (this.cadastralForm.invalid) {
      this.cadastralForm.markAllAsTouched();
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios.', 'Fechar', { duration: 3000 });
      return;
    }

    const payload: Partial<PessoaJuridicaDTO> = {
      razaoSocial: this.cadastralForm.get('razaoSocial')?.value,
      nomeFantasia: this.cadastralForm.get('nomeFantasia')?.value,
      inscricaoEstatual: this.cadastralForm.get('inscricaoEstatual')?.value,
      inscricaoMunicipal: this.cadastralForm.get('inscricaoMunicipal')?.value,
      telefone1: this.cadastralForm.get('telefone')?.value,
      celular: this.cadastralForm.get('celular')?.value,
      email: this.cadastralForm.get('email')?.value,
      endereco: {
        id: this.userId || 0,
        logradouro: this.cadastralForm.get('logradouro')?.value,
        numero: this.cadastralForm.get('numero')?.value,
        complemento: this.cadastralForm.get('complemento')?.value,
        bairro: this.cadastralForm.get('bairro')?.value,
        cidade: this.cadastralForm.get('cidade')?.value,
        estado: this.cadastralForm.get('estado')?.value,
        cep: this.cadastralForm.get('cep')?.value
      }
    };

    const headers = new HttpHeaders({
      'usuario': this.authService.getUsernameFromAccessToken() || ''
    });

    if (this.userId) {
      this.http.put(`${this.baseUrl}/api/v1/pessoa-juridica/alterar/${this.userId}`, payload, { headers }).subscribe({
        next: () => {
          this.snackBar.open('Dados atualizados com sucesso!', 'Fechar', { duration: 3000 });
          this.isEditMode = false;
          Object.keys(this.cadastralForm.controls).forEach(key => {
            this.cadastralForm.get(key)?.disable();
          });
        },
        error: (err) => {
          console.error('Erro ao atualizar dados:', err);
          const errorMessage = err.error?.message || 'Erro ao atualizar os dados. Tente novamente.';
          this.snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  onCancelEdit(): void {
    this.isEditMode = false;
    Object.keys(this.cadastralForm.controls).forEach(key => {
      this.cadastralForm.get(key)?.disable();
    });
    this.loadPessoaJuridicaData();
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.passwordForm.reset();
    }
  }

  onSavePassword(): void {
    if (this.passwordForm.invalid || this.passwordForm.hasError('mismatch')) {
      this.passwordForm.markAllAsTouched();
      this.snackBar.open(
        this.passwordForm.hasError('mismatch') ? 'As senhas não coincidem.' : 'Por favor, preencha todos os campos corretamente.',
        'Fechar',
        { duration: 3000 }
      );
      return;
    }

    const payload: AlterarSenhaDTO = {
      idPessoa: this.userId || 0,
      senhaAtual: this.passwordForm.get('senhaAtual')?.value,
      novaSenha: this.passwordForm.get('novaSenha')?.value,
      confirmacaoNovaSenha: this.passwordForm.get('confirmacaoNovaSenha')?.value
    };

    this.http.put(`${this.baseUrl}/api/v1/users/alterar-senha/pessoa-juridica`, payload, { responseType: 'text' }).subscribe({
      next: () => {
        console.log('Senha alterada com sucesso, ocultando formulário');
        this.snackBar.open('Senha alterada com sucesso!', 'Fechar', { duration: 3000 });
        this.showPasswordForm = false;
        this.passwordForm.reset();
      },
      error: (err) => {
        console.error('Erro ao alterar senha:', err);
        const errorMessage = err.error?.message || 'Erro ao alterar a senha. Tente novamente.';
        this.snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
      }
    });
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}