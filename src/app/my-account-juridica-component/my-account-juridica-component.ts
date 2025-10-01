import { Component, OnInit, OnDestroy, inject, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { environment } from '../../environments/environments';
import { PageEvent } from '@angular/material/paginator';
import { jwtDecode } from 'jwt-decode';
import { MatMenuModule } from '@angular/material/menu';

// Interfaces
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

interface PessoaPlanoDTO {
  idPessoaFisica: number;
  idPessoaJuridica: number;
  tipoPessoa: string;
  idPlano: number;
  ativo: boolean;
  teste: boolean;
  dataInicioTeste: string;
  diaVencimento: number;
  periodoTeste: number;
}

interface PlanOption {
  idPlano: number;
  plano: string;
  usuarios: number;
}

interface UserDTO {
  id: number;
  userName: string;
  fullName: string;
  enabled: boolean;
  tenant: string;
  idPessoaFisica: number;
  idPessoaJuridica: number;
  tipoPessoa: string;
  dataAtualizacao: string;
  roles: string[];
}

interface AccountCredentialsDTO {
  username: string;
  password: string;
  fullname: string;
  role: string;
  idPessoaFisica: number;
  idPessoaJuridica: number;
  tipoPessoa: string;
  tenant: string;
}

@Component({
  selector: 'app-my-account-juridica',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule,
    MatDialogModule,
    MatPaginatorModule,
    MatRadioModule,
    MatSelectModule,
    MatMenuModule
  ],
  templateUrl: './my-account-juridica-component.html',
  styleUrl: './my-account-juridica-component.scss'
})
export class MyAccountJuridicaComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private readonly baseUrl = environment.apiUrl;

  tipoPessoa: string | null = null;
  userRole: string | null = null;
  private tipoPessoaSubscription!: Subscription;
  private userRoleSubscription!: Subscription;

  cadastralForm!: FormGroup;
  passwordForm!: FormGroup;
  createUserForm!: FormGroup;
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

  currentPlan: { plano: string; usuarios: number } | null = null;
  upgradeOptions: PlanOption[] = [];
  selectedUpgradeId: number | null = null;

  linkedUsers: UserDTO[] = [];
  users: UserDTO[] = [];
  totalUsers = 0;
  pageIndex = 0;
  pageSize = 5;
  searchTerm = '';

  @ViewChild('upgradeDialog') upgradeDialog!: TemplateRef<any>;
  @ViewChild('createUserDialog') createUserDialog!: TemplateRef<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private authService: AuthService) {}

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

    this.passwordForm = this.fb.group({
      senhaAtual: ['', Validators.required],
      novaSenha: ['', [Validators.required, Validators.minLength(8)]],
      confirmacaoNovaSenha: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.createUserForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      role: ['', Validators.required]
    });

    this.tipoPessoaSubscription = this.authService.getTipoPessoa().subscribe(tipoPessoa => {
      this.tipoPessoa = tipoPessoa;
      if (tipoPessoa === 'J') {
        this.loadPessoaJuridicaData();
      }
    });

    this.userRoleSubscription = this.authService.getUserRole().subscribe(role => {
      this.userRole = role;
    });

    this.initializeFromToken();
  }

  ngOnDestroy(): void {
    if (this.tipoPessoaSubscription) this.tipoPessoaSubscription.unsubscribe();
    if (this.userRoleSubscription) this.userRoleSubscription.unsubscribe();
  }

  private initializeFromToken(): void {
    const token = this.authService.getAccessToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.tipoPessoa = decoded.tipoPessoa || null;
        this.userId = decoded.idPessoaJuridica || this.getUserIdFromToken();
        console.log('Initialized - tipoPessoa:', this.tipoPessoa, 'userId:', this.userId);

        if (this.userId) {
          this.loadUsers();
        } else {
          this.loadPessoaJuridicaData();
        }
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
  }

  private getUserIdFromToken(): number | null {
    const token = this.authService.getAccessToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded.idPessoaJuridica || null;
      } catch (e) {
        console.error('Erro ao decodificar token para obter userId:', e);
        return null;
      }
    }
    return null;
  }

  private loadPessoaJuridicaData(): void {
    const email = this.authService.getUsernameFromAccessToken();
    if (email) {
      const url = `${this.baseUrl}/api/v1/pessoa-juridica/buscar/email/${email}`;
      this.http.get<PessoaJuridicaPublicaReponseDTO>(url).subscribe({
        next: (data) => {
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
          this.cadastralForm.patchValue(this.userProfile);
          this.loadCurrentPlan();
          this.loadUsers();
        },
        error: (err) => {
          console.error('Erro ao buscar dados de Pessoa Jurídica:', err);
          this.snackBar.open('Erro ao carregar dados da conta.', 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  private loadCurrentPlan(): void {
    if (this.userId) {
      const url = `${this.baseUrl}/api/v1/pessoa-plano/buscar/plano-pessoa-juridica/${this.userId}`;
      this.http.get<PessoaPlanoDTO>(url).subscribe({
        next: (data) => {
          const planMap: { [key: number]: { plano: string; usuarios: number } } = {
            1: { plano: 'Bronze', usuarios: 5 },
            2: { plano: 'Prata', usuarios: 10 },
            3: { plano: 'Ouro', usuarios: 20 }
          };
          this.currentPlan = planMap[data.idPlano] || null;
        },
        error: (err) => {
          console.error('Erro ao buscar plano:', err);
          this.currentPlan = null;
          this.snackBar.open('Erro ao carregar plano atual.', 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  private loadUsers(): void {
    if (!this.userId) {
      this.userId = this.getUserIdFromToken();
    }
    if (!this.userId) {
      console.error('userId is null, cannot load users');
      this.snackBar.open('Erro: ID da Pessoa Jurídica não encontrado.', 'Fechar', { duration: 5000 });
      return;
    }
    const tenant = this.authService.getTenantFromAccessToken();
    if (!tenant) {
      console.error('Tenant is null, cannot proceed with API call');
      this.snackBar.open('Erro: Tenant não encontrado.', 'Fechar', { duration: 5000 });
      return;
    }
    const url = `${this.baseUrl}/api/v1/users/pessoa-juridica?idPessoaJuridica=${this.userId}&tenant=${tenant}`;
    this.http.get<UserDTO[]>(url).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.linkedUsers = [...data];
          this.totalUsers = data.length;
          this.onSearch();
        } else {
          console.error('Unexpected response format:', data);
          this.snackBar.open('Erro: Resposta inválida ao carregar usuários.', 'Fechar', { duration: 5000 });
        }
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
        this.snackBar.open('Erro ao carregar usuários vinculados.', 'Fechar', { duration: 5000 });
      }
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const novaSenha = form.get('novaSenha')?.value;
    const confirmacaoNovaSenha = form.get('confirmacaoNovaSenha')?.value;
    return novaSenha === confirmacaoNovaSenha ? null : { mismatch: true };
  }

  isManager(): boolean { return this.userRole === 'MANAGER'; }
  isApprover(): boolean { return this.userRole === 'APPROVER'; }
  isTechnical(): boolean { return this.userRole === 'TECHNICAL'; }
  isPessoaJuridica(): boolean { return this.tipoPessoa === 'J'; }

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
    const headers = new HttpHeaders({ 'usuario': this.authService.getUsernameFromAccessToken() || '' });
    if (this.userId) {
      this.http.put(`${this.baseUrl}/api/v1/pessoa-juridica/alterar/${this.userId}`, payload, { headers }).subscribe({
        next: () => {
          this.snackBar.open('Dados atualizados com sucesso!', 'Fechar', { duration: 3000 });
          this.isEditMode = false;
          Object.keys(this.cadastralForm.controls).forEach(key => this.cadastralForm.get(key)?.disable());
        },
        error: (err) => {
          console.error('Erro ao atualizar dados:', err);
          this.snackBar.open(err.error?.message || 'Erro ao atualizar os dados. Tente novamente.', 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  onCancelEdit(): void {
    this.isEditMode = false;
    Object.keys(this.cadastralForm.controls).forEach(key => this.cadastralForm.get(key)?.disable());
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
        this.snackBar.open('Senha alterada com sucesso!', 'Fechar', { duration: 3000 });
        this.showPasswordForm = false;
        this.passwordForm.reset();
      },
      error: (err) => {
        console.error('Erro ao alterar senha:', err);
        this.snackBar.open(err.error?.message || 'Erro ao alterar a senha. Tente novamente.', 'Fechar', { duration: 5000 });
      }
    });
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  openUpgradeDialog(): void {
    this.upgradeOptions = [];
    this.selectedUpgradeId = null;
    if (this.currentPlan) {
      const planOrder: { [key: string]: number } = { Bronze: 1, Prata: 2, Ouro: 3 };
      const currentOrder = planOrder[this.currentPlan.plano];
      if (currentOrder < 2) this.upgradeOptions.push({ idPlano: 2, plano: 'Prata', usuarios: 10 });
      if (currentOrder < 3) this.upgradeOptions.push({ idPlano: 3, plano: 'Ouro', usuarios: 20 });
    }
    this.dialog.open(this.upgradeDialog, { width: '400px' });
  }

  closeUpgradeDialog(): void {
    this.dialog.closeAll();
  }

  selectUpgradeOption(idPlano: number): void {
    this.selectedUpgradeId = this.selectedUpgradeId === idPlano ? null : idPlano;
  }

  performUpgrade(): void {
    if (this.userId && this.selectedUpgradeId) {
      const today = new Date();
      const formattedDate = today.toISOString();
      const payload: PessoaPlanoDTO = {
        idPessoaFisica: 0,
        idPessoaJuridica: this.userId,
        tipoPessoa: 'J',
        idPlano: this.selectedUpgradeId,
        ativo: true,
        teste: false,
        dataInicioTeste: formattedDate,
        diaVencimento: 1,
        periodoTeste: 0
      };
      this.http.put<PessoaPlanoDTO>(`${this.baseUrl}/api/v1/pessoa-plano/upgrade`, payload).subscribe({
        next: (response) => {
          this.snackBar.open('Upgrade realizado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadCurrentPlan();
          this.closeUpgradeDialog();
        },
        error: (err) => {
          console.error('Erro ao realizar upgrade:', err);
          this.snackBar.open(err.error?.message || 'Erro ao realizar upgrade. Tente novamente.', 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  openCreateUserDialog(): void {
    this.createUserForm.reset();
    this.dialog.open(this.createUserDialog, { width: '400px' });
  }

  closeCreateUserDialog(): void {
    this.dialog.closeAll();
  }

  createUser(): void {
    if (this.createUserForm.valid && this.userId) {
      const tenant = this.authService.getTenantFromAccessToken();
      if (!tenant) {
        this.snackBar.open('Erro: Tenant não encontrado.', 'Fechar', { duration: 5000 });
        return;
      }

      const payload: AccountCredentialsDTO = {
        username: this.createUserForm.get('username')?.value,
        password: 'Temp1234',
        fullname: this.createUserForm.get('fullName')?.value,
        role: this.createUserForm.get('role')?.value,
        idPessoaFisica: 0,
        idPessoaJuridica: this.userId,
        tipoPessoa: 'J',
        tenant: tenant
      };
      this.http.post<AccountCredentialsDTO>(`${this.baseUrl}/api/v1/users/createUser`, payload).subscribe({
        next: (response) => {
          this.snackBar.open('Usuário criado com sucesso!', 'Fechar', { duration: 3000 });
          this.closeCreateUserDialog();
          this.loadUsers();
          this.onSearch(); // Refresh UI after creating a user
        },
        error: (err) => {
          console.error('Erro ao criar usuário:', err);
          this.snackBar.open(err.error?.message || 'Erro ao criar usuário. Tente novamente.', 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.onSearch();
  }

  onSearch(): void {
    this.users = this.linkedUsers.filter(user =>
      user.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.userName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.totalUsers = this.users.length;
    const startIndex = this.pageIndex * this.pageSize;
    this.users = this.users.slice(startIndex, startIndex + this.pageSize);
  }

  blockUser(id: number): void {
    this.http.put(`${this.baseUrl}/api/v1/users/bloquear/${id}`, {}).subscribe({
      next: () => {
        this.snackBar.open('Usuário bloqueado com sucesso!', 'Fechar', { duration: 3000 });
        this.loadUsers();
        this.onSearch(); // Refresh UI after blocking
      },
      error: (err) => this.snackBar.open('Erro ao bloquear usuário.', 'Fechar', { duration: 5000 })
    });
  }

  unblockUser(id: number): void {
    this.http.put(`${this.baseUrl}/api/v1/users/desbloquear/${id}`, {}).subscribe({
      next: () => {
        this.snackBar.open('Usuário desbloqueado com sucesso!', 'Fechar', { duration: 3000 });
        this.loadUsers();
        this.onSearch(); // Refresh UI after unblocking
      },
      error: (err) => this.snackBar.open('Erro ao desbloquear usuário.', 'Fechar', { duration: 5000 })
    });
  }

  promoteToApprover(id: number): void {
    this.http.put(`${this.baseUrl}/api/v1/users/promover/aprovador/${id}`, {}).subscribe({
      next: () => {
        this.snackBar.open('Usuário promovido a Aprovador com sucesso!', 'Fechar', { duration: 3000 });
        this.loadUsers();
        this.onSearch(); // Refresh UI after promotion
      },
      error: (err) => {
        console.error('Erro ao promover a Aprovador:', err);
        const errorMessage = err.error?.message || 'Erro ao promover a Aprovador.';
        this.snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
      }
    });
  }

  promoteToTechnical(id: number): void {
    this.http.put(`${this.baseUrl}/api/v1/users/promover/tecnico/${id}`, {}).subscribe({
      next: () => {
        this.snackBar.open('Usuário promovido a Técnico com sucesso!', 'Fechar', { duration: 3000 });
        this.loadUsers();
        this.onSearch(); // Refresh UI after promotion
      },
      error: (err) => {
        console.error('Erro ao promover a Técnico:', err);
        const errorMessage = err.error?.message || 'Erro ao promover a Técnico.';
        this.snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
      }
    });
  }

  deleteUser(id: number): void {
    this.http.put(`${this.baseUrl}/api/v1/users/deletar/${id}`, {}).subscribe({
      next: () => {
        this.snackBar.open('Usuário deletado com sucesso!', 'Fechar', { duration: 3000 });
        this.loadUsers();
        this.onSearch(); // Refresh UI after deletion
      },
      error: (err) => this.snackBar.open('Erro ao deletar usuário.', 'Fechar', { duration: 5000 })
    });
  }

  isPrimaryUser(userIdToCheck: number): boolean {
    console.log('Checking if userId', userIdToCheck, 'is primary. Current userId:', this.userId);
    return this.userId !== null && userIdToCheck === this.userId;
  }

  getUserRoleLabel(roles: string[]): string {
    if (roles.includes('MANAGER')) return 'Gerente';
    if (roles.includes('APPROVER')) return 'Aprovador';
    if (roles.includes('TECHNICAL')) return 'Técnico';
    return 'Permissão: Não definida';
  }
}