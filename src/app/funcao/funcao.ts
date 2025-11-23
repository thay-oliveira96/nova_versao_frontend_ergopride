import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { FuncaoDTO } from '../models/funcao.model';
import { filter, Subscription, switchMap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuncaoService } from '../services/funcao.service';
import { AuthService } from '../auth/auth.service';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-funcao',
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
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './funcao.html',
  styleUrl: './funcao.scss'
})
export class FuncaoComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  funcoes: FuncaoDTO[] = [];
  loading = false;
  showForm = false;
  editingId: number | null = null;
  
  funcaoForm: FormGroup;
  displayedColumns: string[] = ['id', 'descricao', 'observacao', 'acoes'];
  dataSource = new MatTableDataSource<FuncaoDTO>([]);

  public canDelete: boolean = false;
  private authSubscription!: Subscription;

  totalElements: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private funcaoService: FuncaoService,
    private cdr: ChangeDetectorRef,
    private translocoService: TranslocoService,
    private authService: AuthService
  ) {
    this.funcaoForm = this.fb.group({
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      observacao: ['', [Validators.required, Validators.minLength(3)]]
    });
  }
  
  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn().pipe(
      filter((isLoggedIn: boolean) => isLoggedIn),
      switchMap(() => this.authService.getUserRole())
    ).subscribe({
      next: role => {
        this.canDelete = (role !== 'APPROVER');
        console.log('Permissão de deletar atualizada:', this.canDelete);
        this.loadFuncoes();
      },
      error: err => {
        console.error('Erro ao obter role:', err);
        this.loadFuncoes(); // Fallback to load data
      }
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
    if (this.funcoes.length === 0) {
      this.loadFuncoes();
    }
  }

  loadFuncoes(): void {
    console.log('Loading funções started at:', new Date().toISOString());
    this.loading = true;
    this.funcaoService.getAllFuncoes(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        console.log('API Response received at:', new Date().toISOString(), response);
        let data: FuncaoDTO[] = [];
        if (Array.isArray(response)) {
          data = response;
        } else if ('content' in response && Array.isArray(response.content)) {
          data = response.content;
        }
        this.funcoes = data;
        this.dataSource.data = [...this.funcoes]; // Force new array reference
        this.totalElements = Array.isArray(response) ? data.length : (response.totalElements || data.length);
        this.loading = false;
        this.cdr.detectChanges(); // Ensure UI updates
        console.log('DataSource data after update:', this.dataSource.data);
        this.snackBar.open(this.translocoService.translate('funcao.funcaoCarregadoSucesso'), this.translocoService.translate('global.fechar'), { duration: 2000 });
      },
      error: (err) => {
        console.error('Error loading funções at:', new Date().toISOString(), err);
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(this.translocoService.translate('funcao.erroCarregaConexao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
      },
      complete: () => {
        console.log('LoadFuncoes subscription completed at:', new Date().toISOString());
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
    this.loadFuncoes();
  }

  showCreateForm(): void {
    this.showForm = true;
    this.editingId = null;
    this.funcaoForm.reset();
  }

  showEditForm(funcao: FuncaoDTO): void {
    this.showForm = true;
    this.editingId = funcao.id || null;
    
    if (funcao.id) {
      this.loading = true;
      this.funcaoService.getFuncaoById(funcao.id).subscribe({
        next: (data) => {
          this.funcaoForm.patchValue({
            descricao: data.descricao,
            observacao: data.observacao
          });
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(this.translocoService.translate('funcao.erroCarregarEdicao'), err);
          this.loading = false;
          this.cdr.detectChanges();
          this.snackBar.open(this.translocoService.translate('funcao.erroCarregarEdicao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          this.cancelForm();
        }
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.funcaoForm.reset();
  }

  onSubmit(): void {
    if (this.funcaoForm.valid) {
      const formData: FuncaoDTO = this.funcaoForm.value;
      
      if (this.editingId) {
        this.funcaoService.updateFuncao(this.editingId, formData).subscribe({
          next: (updatedFuncao) => {
            this.snackBar.open(this.translocoService.translate('funcao.atualizadoComSucesso'), this.translocoService.translate('global.fechar'), { duration: 3000 });
            this.cancelForm();
            this.loadFuncoes();
          },
          error: (err) => {
            console.error('Erro ao atualizar funcao:', err);
            this.snackBar.open(this.translocoService.translate('funcao.erroAtualizar'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      } else {
        this.funcaoService.createFuncao(formData).subscribe({
          next: (newFuncao) => {
            this.snackBar.open(this.translocoService.translate('funcao.criadoComSucesso'), this.translocoService.translate('global.fechar'), { duration: 3000 });
            this.cancelForm();
            this.loadFuncoes();
          },
          error: (err) => {
            console.error(this.translocoService.translate('funcao.erroCriar'), err);
            this.snackBar.open(this.translocoService.translate('funcao.erroCriarConexao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      }
    } else {
      this.snackBar.open(this.translocoService.translate('funcao.porFavorPreencha'), this.translocoService.translate('global.fechar'), { duration: 3000, panelClass: ['snackbar-warning'] });
    }
  }

  deleteFuncao(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { title: this.translocoService.translate('funcao.confirmarExclusao'), message: this.translocoService.translate('funcao.mensagemExclusao')}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.funcaoService.deleteFuncao(id).subscribe({
          next: () => {
            this.snackBar.open(this.translocoService.translate('funcao.excluidoComSucesso'), this.translocoService.translate('global.fechar'), { duration: 3000 });
            this.loadFuncoes();
          },
          error: (err) => {
            console.error(this.translocoService.translate('funcao.erroAoExcluir'), err);
            this.snackBar.open(this.translocoService.translate('funcao.erroAoExcluirConexao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.funcaoForm.get(controlName);
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