import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';

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

interface PessoaFisicaPublicaReponseDTO {
  id: number;
  nome: string;
  sobrenome: string;
  cpf: string;
  dataNascimento: string;
  endereco: EnderecoPublicoResponseDTO;
  telefone: string;
  celular: string;
  email: string;
}

@Component({
  selector: 'app-my-account',
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
    MatListModule
  ],
  templateUrl: './my-account-component.html',
  styleUrl: './my-account-component.scss'
})
export class MyAccountComponent implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  tipoPessoa: string | null = null;
  userRole: string | null = null;
  private tipoPessoaSubscription!: Subscription;
  private userRoleSubscription!: Subscription;

  cadastralForm!: FormGroup;

  userProfile = {
    nomeCompleto: 'Carregando...',
    email: 'Carregando...',
    cpf: 'Carregando...',
    telefone: 'Carregando...',
    celular: 'Carregando...',
    dataNascimento: 'Carregando...',
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
    // Inicializa o formulário com campos desabilitados para visualização
    this.cadastralForm = this.fb.group({
      nomeCompleto: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      cpf: [{ value: '', disabled: true }],
      telefone: [{ value: '', disabled: true }],
      celular: [{ value: '', disabled: true }],
      dataNascimento: [{ value: '', disabled: true }],
      logradouro: [{ value: '', disabled: true }],
      numero: [{ value: '', disabled: true }],
      complemento: [{ value: '', disabled: true }],
      bairro: [{ value: '', disabled: true }],
      cidade: [{ value: '', disabled: true }],
      estado: [{ value: '', disabled: true }],
      cep: [{ value: '', disabled: true }]
    });

    // Inscreve-se para o tipo de pessoa e busca os dados se for Pessoa Física
    this.tipoPessoaSubscription = this.authService.getTipoPessoa().subscribe(tipoPessoa => {
      this.tipoPessoa = tipoPessoa;
      console.log("Tipo Pessoa: " + tipoPessoa);
      if (tipoPessoa === 'F') {
        this.loadPessoaFisicaData();
      }
    });

    // Inscreve-se para a role do usuário
    this.userRoleSubscription = this.authService.getUserRole().subscribe(role => {
      this.userRole = role;
      console.log("User Role: " + this.userRole);
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

  private loadPessoaFisicaData(): void {
    const email = this.authService.getUsernameFromAccessToken();
    if (email) {
      const url = `${this.baseUrl}/api/v1/pessoa-fisica/buscar/email/${email}`;
      this.http.get<PessoaFisicaPublicaReponseDTO>(url).subscribe({
        next: (data) => {
          console.log('Dados de Pessoa Física recebidos:', data);
          this.userProfile.nomeCompleto = `${data.nome} ${data.sobrenome}`;
          this.userProfile.email = data.email;
          this.userProfile.cpf = data.cpf;
          this.userProfile.telefone = data.telefone;
          this.userProfile.celular = data.celular;
          this.userProfile.dataNascimento = data.dataNascimento;
          
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
            nomeCompleto: this.userProfile.nomeCompleto,
            email: this.userProfile.email,
            cpf: this.userProfile.cpf,
            telefone: this.userProfile.telefone,
            celular: this.userProfile.celular,
            dataNascimento: this.userProfile.dataNascimento,
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
          console.error('Erro ao buscar dados de Pessoa Física:', err);
        }
      });
    }
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
  
  isPessoaFisica(): boolean {
    return this.tipoPessoa === 'F';
  }

  onEditProfile(): void {
    console.log('Botão de editar clicado.');
  }

  onSaveChanges(): void {
    console.log('Botão de salvar clicado.');
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}