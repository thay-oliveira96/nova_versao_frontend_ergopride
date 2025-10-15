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
    TranslocoModule
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
  
  empresaForm: FormGroup;
  displayedColumns: string[] = ['id', 'nome', 'cnpj', 'acoes']; // Adjusted to show only id, nome, cnpj
  dataSource = new MatTableDataSource<EmpresaDTO>([]);

  public canDelete: boolean = false;
  private authSubscription!: Subscription;
  totalElements: number = 0; // Track total items for pagination
  pageSize: number = 10; // Default page size
  pageIndex: number = 0; // Current page index

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
        this.totalElements = data.totalElements; // Update total for pagination
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(this.translocoService.translate('empresas.empresaCarregadaSucesso'), this.translocoService.translate('global.fechar'), { duration: 2000 });
      },
      error: (err) => {
        console.error(this.translocoService.translate('empresas.erroCarregar'), err);
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(this.translocoService.translate('empresas.erroCarregaConexao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
      }
    });
  }
  
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.loadEmpresas(); // Reload with filter (adjust API if needed for server-side filtering)
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
  }

  showEditForm(empresa: EmpresaDTO): void {
    this.showForm = true;
    this.editingId = empresa.id || null;
    
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
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(this.translocoService.translate('empresas.erroCarregarEdicao'), err);
          this.loading = false;
          this.cdr.detectChanges();
          this.snackBar.open(this.translocoService.translate('empresas.erroCarregarEdicao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          this.cancelForm();
        }
      });
    } else {
      this.empresaForm.patchValue({
        nome: empresa.nome,
        cnpj: empresa.cnpj,
        cnae: empresa.cnae,
        endereco: empresa.endereco,
        numero: empresa.numero,
        bairro: empresa.bairro,
        cep: empresa.cep,
        municipio: empresa.municipio,
        estado: empresa.estado,
        trabalhadores: empresa.trabalhadores,
        atividade: empresa.atividade,
        datainfo: empresa.datainfo,
        dataAtualizacao: empresa.dataAtualizacao,
        usuario: empresa.usuario,
        logo: empresa.logo
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.empresaForm.reset();
  }

  onSubmit(): void {
    if (this.empresaForm.valid) {
      const formData: EmpresaDTO = this.empresaForm.value;
      
      if (this.editingId) {
        this.empresaService.updateEmpresa(this.editingId, formData).subscribe({
          next: (updatedEmpresa) => {
            this.snackBar.open(this.translocoService.translate('empresas.atualizadoComSucesso'), this.translocoService.translate('global.fechar'), { duration: 3000 });
            this.cancelForm();
            this.loadEmpresas();
          },
          error: (err) => {
            console.error('Erro ao atualizar empresa:', err);
            this.snackBar.open(this.translocoService.translate('empresas.erroAtualizar'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      } else {
        this.empresaService.createEmpresa(formData).subscribe({
          next: (newEmpresa) => {
            this.snackBar.open('Empresa criada com sucesso!', this.translocoService.translate('global.fechar'), { duration: 3000 });
            this.cancelForm();
            this.loadEmpresas();
          },
          error: (err) => {
            console.error(this.translocoService.translate('erroAoCriar'), err);
            this.snackBar.open(this.translocoService.translate('erroAoCriarConexao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      }
    } else {
      this.snackBar.open(this.translocoService.translate('empresas.porFavorPreencha'), this.translocoService.translate('global.fechar'), { duration: 3000, panelClass: ['snackbar-warning'] });
    }
  }

  deleteEmpresa(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { title: this.translocoService.translate('empresas.confirmarExclusao'), message: this.translocoService.translate('empresas.mensagemExclusao')}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.empresaService.deleteEmpresa(id).subscribe({
          next: () => {
            this.snackBar.open(this.translocoService.translate('empresas.excluidoComSucesso'), this.translocoService.translate('global.fechar'), { duration: 3000 });
            this.loadEmpresas();
          },
          error: (err) => {
            console.error(this.translocoService.translate('empresas.erroAoExcluir'), err);
            this.snackBar.open(this.translocoService.translate('empresas.erroAoExcluirConexao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
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