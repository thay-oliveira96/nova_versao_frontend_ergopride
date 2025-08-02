import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

// Angular Material Modules
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Importe o serviço e o modelo
import { DepartamentoService } from '../../services/departamento.service';
import { DepartamentoDTO } from '../../models/departamento.model';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-departamento',
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
  templateUrl: './departamento.html',
  styleUrl: './departamento.scss'
})
export class DepartamentoComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  departamentos: DepartamentoDTO[] = [];
  loading = false;
  showForm = false;
  editingId: number | null = null;
  
  departamentoForm: FormGroup;
  displayedColumns: string[] = ['id', 'descricao', 'observacao', 'acoes'];
  dataSource = new MatTableDataSource<DepartamentoDTO>([]);

  public canDelete: boolean = false;
  private authSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private departamentoService: DepartamentoService,
    private cdr: ChangeDetectorRef,
    private translocoService: TranslocoService,
    private authService: AuthService
  ) {
    this.departamentoForm = this.fb.group({
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      observacao: ['', [Validators.required, Validators.minLength(3)]]
    });
  }
  
  ngOnInit(): void {
    // NOVO: A lógica agora depende do estado de login
    this.authSubscription = this.authService.isLoggedIn().pipe(
      filter(isLoggedIn => isLoggedIn), // Espera até que o usuário esteja logado
      switchMap(() => this.authService.getUserRole()) // Troca para o observable da role
    ).subscribe(role => {
      // Quando a role estiver disponível, a permissão é definida
      this.canDelete = (role !== 'APPROVER');
      console.log('Permissão de deletar atualizada:', this.canDelete);

      // Carrega os departamentos apenas depois que o login é confirmado
      this.loadDepartamentos();
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

  /**
   * Carrega a lista de departamentos da API.
   */
  loadDepartamentos(): void {
    this.loading = true;
    this.departamentoService.getAllDepartamentos().subscribe({
      next: (data) => {
        this.departamentos = data;
        this.dataSource.data = this.departamentos;
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(this.translocoService.translate('departamentos.departamentoCarregadoSucesso'), this.translocoService.translate('global.fechar'), { duration: 2000 });
      },
      error: (err) => {
        console.error(this.translocoService.translate('departamentos.erroCarregar'), err);
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(this.translocoService.translate('departamentos.erroCarregaConexao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
      }
    });
  }
  
  // O restante dos métodos (applyFilter, showCreateForm, showEditForm, etc.) permanece inalterado
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  showCreateForm(): void {
    this.showForm = true;
    this.editingId = null;
    this.departamentoForm.reset();
  }

  showEditForm(departamento: DepartamentoDTO): void {
    this.showForm = true;
    this.editingId = departamento.id || null;
    
    if (departamento.id) {
      this.loading = true;
      this.departamentoService.getDepartamentoById(departamento.id).subscribe({
        next: (data) => {
          this.departamentoForm.patchValue({
            descricao: data.descricao,
            observacao: data.observacao
          });
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(this.translocoService.translate('departamentos.erroCarregarEdicao'), err);
          this.loading = false;
          this.cdr.detectChanges();
          this.snackBar.open(this.translocoService.translate('departamentos.erroCarregarEdicao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          this.cancelForm();
        }
      });
    } else {
      this.departamentoForm.patchValue({
        descricao: departamento.descricao,
        observacao: departamento.observacao
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.departamentoForm.reset();
  }

  onSubmit(): void {
    if (this.departamentoForm.valid) {
      const formData: DepartamentoDTO = this.departamentoForm.value;
      
      if (this.editingId) {
        this.departamentoService.updateDepartamento(this.editingId, formData).subscribe({
          next: (updatedDept) => {
            this.snackBar.open(this.translocoService.translate('departamentos.autalizadoComSucesso'), this.translocoService.translate('global.fechar'), { duration: 3000 });
            this.cancelForm();
            this.loadDepartamentos();
          },
          error: (err) => {
            console.error('Erro ao atualizar departamento:', err);
            this.snackBar.open(this.translocoService.translate('departamentos.erroAtualizar'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      } else {
        this.departamentoService.createDepartamento(formData).subscribe({
          next: (newDept) => {
            this.snackBar.open('Departamento criado com sucesso!', this.translocoService.translate('global.fechar'), { duration: 3000 });
            this.cancelForm();
            this.loadDepartamentos();
          },
          error: (err) => {
            console.error(this.translocoService.translate('erroAoCriar'), err);
            this.snackBar.open(this.translocoService.translate('erroAoCriarConexao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      }
    } else {
      this.snackBar.open(this.translocoService.translate('departamentos.porFavorPreencha'), this.translocoService.translate('global.fechar'), { duration: 3000, panelClass: ['snackbar-warning'] });
    }
  }

  deleteDepartamento(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { title: this.translocoService.translate('departamentos.confirmarExclusao'), message: this.translocoService.translate('departamentos.mensagemExclusao')}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.departamentoService.deleteDepartamento(id).subscribe({
          next: () => {
            this.snackBar.open(this.translocoService.translate('departamentos.excluidoComSucesso'), this.translocoService.translate('global.fechar'), { duration: 3000 });
            this.loadDepartamentos();
          },
          error: (err) => {
            console.error(this.translocoService.translate('departamentos.erroAoExcluir'), err);
            this.snackBar.open(this.translocoService.translate('departamentos.erroAoExcluirConexao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.departamentoForm.get(controlName);
    if (control?.hasError('required')) {
      return this.translocoService.translate('errosGlobais.campoObrigatorio');
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.getError('minlength').requiredLength;
      return this.translocoService.translate('errosGlobais.campoDeveTerTamnaho', { requiredLength: requiredLength });
    }
    return '';
  }
}