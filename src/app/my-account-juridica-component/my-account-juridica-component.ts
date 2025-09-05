import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
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

@Component({
  selector: 'app-my-account-juridica',
  standalone: true, // Adicionado para funcionar como componente autônomo
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
  templateUrl: './my-account-juridica-component.html',
  styleUrl: './my-account-juridica-component.scss'
})
export class MyAccountJuridicaComponent implements OnInit, OnDestroy {
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
    razaoSocial: 'Carregando...',
    nomeFantasia: 'Carregando...',
    cnpj: 'Carregando...',
    inscricaoEstatual: 'Carregando...',
    inscricaoMunicipal: 'Carregando...',
    telefone: 'Carregando...',
    celular: 'Carregando...',
    email: 'Carregando...',
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
    this.cadastralForm = this.fb.group({
      razaoSocial: [{ value: '', disabled: true }],
      nomeFantasia: [{ value: '', disabled: true }],
      cnpj: [{ value: '', disabled: true }],
      inscricaoEstatual: [{ value: '', disabled: true }],
      inscricaoMunicipal: [{ value: '', disabled: true }],
      telefone: [{ value: '', disabled: true }],
      celular: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      logradouro: [{ value: '', disabled: true }],
      numero: [{ value: '', disabled: true }],
      complemento: [{ value: '', disabled: true }],
      bairro: [{ value: '', disabled: true }],
      cidade: [{ value: '', disabled: true }],
      estado: [{ value: '', disabled: true }],
      cep: [{ value: '', disabled: true }]
    });
  
    // Inscreve-se para o tipo de pessoa e busca os dados se for Pessoa Jurídica
    this.tipoPessoaSubscription = this.authService.getTipoPessoa().subscribe(tipoPessoa => {
      this.tipoPessoa = tipoPessoa;
      console.log("Tipo Pessoa: " + tipoPessoa);
      if (tipoPessoa === 'J') {
        this.loadPessoaJuridicaData();
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

  private loadPessoaJuridicaData(): void {
    const email = this.authService.getUsernameFromAccessToken();
    if (email) {
      // Corrigido o erro de digitação na URL
      const url = `${this.baseUrl}/api/v1/pessoa-juridica/buscar/email/${email}`;
      this.http.get<PessoaJuridicaPublicaReponseDTO>(url).subscribe({
        next: (data) => {
          console.log('Dados de Pessoa Juridica recebidos:', data);
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
            razaoSocial: this.userProfile.razaoSocial, // Corrigido o nome do campo
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
          console.error('Erro ao buscar dados de Pessoa Juridica:', err);
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
  
  isPessoaJuridica(): boolean {
    return this.tipoPessoa === 'J';
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