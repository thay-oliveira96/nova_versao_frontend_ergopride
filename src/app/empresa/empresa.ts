import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmpresaService } from '../services/empresa.service';
import { EmpresaDTO } from '../models/empresa.model';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../auth/auth.service';
import { MatDivider } from "@angular/material/divider";

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    TranslocoModule,
    MatDivider
],
  templateUrl: './empresa.html',
  styleUrl: './empresa.scss'
})
export class EmpresaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  empresas: EmpresaDTO[] = [];
  loading = false;
  showForm = false;
  editingId: number | null = null;
  
  // Variáveis para gerenciamento de logo
  logoFile: File | null = null;
  logoPreview: string | null = null;
  logoAtualUrl: string | null = null;
  
  empresaForm: FormGroup;
  displayedColumns: string[] = ['id', 'nome', 'cnpj', 'acoes'];
  dataSource = new MatTableDataSource<EmpresaDTO>([]);

  public canDelete: boolean = false;
  private authSubscription!: Subscription;
  totalElements: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  // Constantes para validação de arquivo
  readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private empresaService: EmpresaService,
    private cdr: ChangeDetectorRef,
    private translocoService: TranslocoService,
    private authService: AuthService
  ) {
    this.empresaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cnpj: ['', [Validators.required, Validators.minLength(14)]],
      cnae: ['', Validators.minLength(3)],
      endereco: ['', Validators.minLength(3)],
      numero: ['', Validators.min(1)],
      bairro: ['', Validators.minLength(3)],
      cep: ['', [Validators.required, Validators.minLength(8)]],
      municipio: ['', [Validators.required, Validators.minLength(3)]],
      estado: ['', [Validators.required, Validators.minLength(2)]],
      trabalhadores: ['', Validators.min(1)],
      atividade: ['', Validators.minLength(3)],
      datainfo: [''],
      dataAtualizacao: [''],
      usuario: [''],
      logo: ['']
    });
  }
  
  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn().pipe(
      filter(isLoggedIn => isLoggedIn),
      switchMap(() => this.authService.getUserRole())
    ).subscribe(role => {
      this.canDelete = (role !== 'APPROVER');
      this.loadEmpresas();
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.cdr.detectChanges(); 
  }

  loadEmpresas(): void {
    this.loading = true;
    this.empresaService.getAllEmpresas(this.pageIndex, this.pageSize, ['id,asc']).subscribe({
      next: (data) => {
        this.empresas = data.content;
        this.dataSource.data = this.empresas;
        this.totalElements = data.totalElements;
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(
          this.translocoService.translate('empresas.empresaCarregadaSucesso'), 
          this.translocoService.translate('global.fechar'), 
          { duration: 2000 }
        );
      },
      error: (err) => {
        console.error(this.translocoService.translate('empresas.erroCarregar'), err);
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(
          this.translocoService.translate('empresas.erroCarregaConexao'), 
          this.translocoService.translate('global.fechar'), 
          { duration: 5000, panelClass: ['snackbar-error'] }
        );
      }
    });
  }
  
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEmpresas();
  }

  showCreateForm(): void {
    this.showForm = true;
    this.editingId = null;
    this.empresaForm.reset();
    this.limparLogo();
  }

  showEditForm(empresa: EmpresaDTO): void {
    this.showForm = true;
    this.editingId = empresa.id || null;
    this.limparLogo();
    
    if (empresa.id) {
      this.loading = true;
      this.empresaService.getEmpresaById(empresa.id).subscribe({
        next: (data) => {
          this.empresaForm.patchValue({
            nome: data.nome,
            cnpj: data.cnpj,
            cnae: data.cnae,
            endereco: data.endereco,
            numero: data.numero,
            bairro: data.bairro,
            cep: data.cep,
            municipio: data.municipio,
            estado: data.estado,
            trabalhadores: data.trabalhadores,
            atividade: data.atividade,
            datainfo: data.datainfo,
            dataAtualizacao: data.dataAtualizacao,
            usuario: data.usuario,
            logo: data.logo
          });
          
          // Se existe logo, carrega a URL
          if (data.logo) {
            this.logoAtualUrl = data.logo;
            this.logoPreview = data.logo;
          }
          
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(this.translocoService.translate('empresas.erroCarregarEdicao'), err);
          this.loading = false;
          this.cdr.detectChanges();
          this.snackBar.open(
            this.translocoService.translate('empresas.erroCarregarEdicao'), 
            this.translocoService.translate('global.fechar'), 
            { duration: 5000, panelClass: ['snackbar-error'] }
          );
          this.cancelForm();
        }
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.empresaForm.reset();
    this.limparLogo();
  }

  /**
   * Manipula a seleção de arquivo de logo
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar tipo de arquivo
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        this.snackBar.open(
          this.translocoService.translate('empresas.logoFormatoInvalido') || 
          'Formato de arquivo inválido. Use JPG, PNG ou GIF.',
          this.translocoService.translate('global.fechar'),
          { duration: 5000, panelClass: ['snackbar-error'] }
        );
        input.value = '';
        return;
      }
      
      // Validar tamanho
      if (file.size > this.MAX_FILE_SIZE) {
        this.snackBar.open(
          this.translocoService.translate('empresas.logoTamanhoExcedido') || 
          'O arquivo deve ter no máximo 5MB.',
          this.translocoService.translate('global.fechar'),
          { duration: 5000, panelClass: ['snackbar-error'] }
        );
        input.value = '';
        return;
      }
      
      this.logoFile = file;
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Remove o preview do logo
   */
  removerLogoPreview(): void {
    this.logoFile = null;
    this.logoPreview = this.logoAtualUrl; // Volta para o logo atual se estiver editando
    
    // Limpa o input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Remove o logo do servidor (apenas em edição)
   */
  removerLogoServidor(): void {
    if (!this.editingId) return;
    
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { 
        title: this.translocoService.translate('empresas.confirmarRemocaoLogo') || 'Confirmar Remoção',
        message: this.translocoService.translate('empresas.mensagemRemocaoLogo') || 
                 'Deseja realmente remover o logo desta empresa?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.editingId) {
        this.empresaService.removerLogo(this.editingId).subscribe({
          next: () => {
            this.snackBar.open(
              this.translocoService.translate('empresas.logoRemovidoSucesso') || 'Logo removido com sucesso!',
              this.translocoService.translate('global.fechar'),
              { duration: 3000 }
            );
            this.limparLogo();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Erro ao remover logo:', err);
            this.snackBar.open(
              this.translocoService.translate('empresas.erroRemoverLogo') || 'Erro ao remover logo',
              this.translocoService.translate('global.fechar'),
              { duration: 5000, panelClass: ['snackbar-error'] }
            );
          }
        });
      }
    });
  }

  /**
   * Limpa todas as variáveis relacionadas ao logo
   */
  private limparLogo(): void {
    this.logoFile = null;
    this.logoPreview = null;
    this.logoAtualUrl = null;
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.empresaForm.valid) {
      const formData: EmpresaDTO = this.empresaForm.value;
      
      if (this.editingId) {
        // Atualizar empresa
        if (this.logoFile) {
          // Com novo logo
          this.empresaService.updateEmpresaComLogo(this.editingId, formData, this.logoFile).subscribe({
            next: (updatedEmpresa) => {
              this.snackBar.open(
                this.translocoService.translate('empresas.atualizadoComSucesso'),
                this.translocoService.translate('global.fechar'),
                { duration: 3000 }
              );
              this.cancelForm();
              this.loadEmpresas();
            },
            error: (err) => {
              console.error('Erro ao atualizar empresa:', err);
              this.snackBar.open(
                this.translocoService.translate('empresas.erroAtualizar'),
                this.translocoService.translate('global.fechar'),
                { duration: 5000, panelClass: ['snackbar-error'] }
              );
            }
          });
        } else {
          // Sem novo logo
          this.empresaService.updateEmpresa(this.editingId, formData).subscribe({
            next: (updatedEmpresa) => {
              this.snackBar.open(
                this.translocoService.translate('empresas.atualizadoComSucesso'),
                this.translocoService.translate('global.fechar'),
                { duration: 3000 }
              );
              this.cancelForm();
              this.loadEmpresas();
            },
            error: (err) => {
              console.error('Erro ao atualizar empresa:', err);
              this.snackBar.open(
                this.translocoService.translate('empresas.erroAtualizar'),
                this.translocoService.translate('global.fechar'),
                { duration: 5000, panelClass: ['snackbar-error'] }
              );
            }
          });
        }
      } else {
        // Criar nova empresa
        if (this.logoFile) {
          // Com logo
          this.empresaService.createEmpresaComLogo(formData, this.logoFile).subscribe({
            next: (newEmpresa) => {
              this.snackBar.open(
                this.translocoService.translate('empresas.criadoComSucesso') || 'Empresa criada com sucesso!',
                this.translocoService.translate('global.fechar'),
                { duration: 3000 }
              );
              this.cancelForm();
              this.loadEmpresas();
            },
            error: (err) => {
              console.error(this.translocoService.translate('erroAoCriar'), err);
              this.snackBar.open(
                this.translocoService.translate('erroAoCriarConexao'),
                this.translocoService.translate('global.fechar'),
                { duration: 5000, panelClass: ['snackbar-error'] }
              );
            }
          });
        } else {
          // Sem logo
          this.empresaService.createEmpresa(formData).subscribe({
            next: (newEmpresa) => {
              this.snackBar.open(
                this.translocoService.translate('empresas.criadoComSucesso') || 'Empresa criada com sucesso!',
                this.translocoService.translate('global.fechar'),
                { duration: 3000 }
              );
              this.cancelForm();
              this.loadEmpresas();
            },
            error: (err) => {
              console.error(this.translocoService.translate('erroAoCriar'), err);
              this.snackBar.open(
                this.translocoService.translate('erroAoCriarConexao'),
                this.translocoService.translate('global.fechar'),
                { duration: 5000, panelClass: ['snackbar-error'] }
              );
            }
          });
        }
      }
    } else {
      this.snackBar.open(
        this.translocoService.translate('empresas.porFavorPreencha'),
        this.translocoService.translate('global.fechar'),
        { duration: 3000, panelClass: ['snackbar-warning'] }
      );
    }
  }

  deleteEmpresa(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { 
        title: this.translocoService.translate('empresas.confirmarExclusao'),
        message: this.translocoService.translate('empresas.mensagemExclusao')
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.empresaService.deleteEmpresa(id).subscribe({
          next: () => {
            this.snackBar.open(
              this.translocoService.translate('empresas.excluidoComSucesso'),
              this.translocoService.translate('global.fechar'),
              { duration: 3000 }
            );
            this.loadEmpresas();
          },
          error: (err) => {
            console.error(this.translocoService.translate('empresas.erroAoExcluir'), err);
            this.snackBar.open(
              this.translocoService.translate('empresas.erroAoExcluirConexao'),
              this.translocoService.translate('global.fechar'),
              { duration: 5000, panelClass: ['snackbar-error'] }
            );
          }
        });
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.empresaForm.get(controlName);
    if (control?.hasError('required')) {
      return this.translocoService.translate('errosGlobais.campoObrigatorio');
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.getError('minlength').requiredLength;
      return this.translocoService.translate('errosGlobais.campoDeveTerTamnaho', { requiredLength: requiredLength });
    }
    if (control?.hasError('min')) {
      return this.translocoService.translate('errosGlobais.campoDeveSerMaiorQueZero');
    }
    return '';
  }
}