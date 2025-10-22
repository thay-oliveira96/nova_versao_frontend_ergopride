import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
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
    TranslocoModule],
  templateUrl: './funcao.html',
  styleUrl: './funcao.scss'
})
export class Funcao implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  funcao: FuncaoDTO[] = [];
  loading = false;
  showForm = false;
  editingId: number | null = null;
  
  funcaoForm: FormGroup;
  displayedColumns: string[] = ['id', 'descricao', 'observacao', 'acoes'];
  dataSource = new MatTableDataSource<FuncaoDTO>([]);

  public canDelete: boolean = false;
  private authSubscription!: Subscription;

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
    // NOVO: A lógica agora depende do estado de login
    this.authSubscription = this.authService.isLoggedIn().pipe(
      filter((isLoggedIn: any) => isLoggedIn), // Espera até que o usuário esteja logado
      switchMap(() => this.authService.getUserRole()) // Troca para o observable da role
    ).subscribe(role => {
      // Quando a role estiver disponível, a permissão é definida
      this.canDelete = (role !== 'APPROVER');
      console.log('Permissão de deletar atualizada:', this.canDelete);

      // Carrega os funcaos apenas depois que o login é confirmado
      this.loadfuncoes();
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
   * Carrega a lista de funcaos da API.
   */
  loadfuncoes(): void {
    this.loading = true;
    this.funcaoService.getAllFuncoes().subscribe({
      next: (data) => {
        this.funcao = data;
        this.dataSource.data = this.funcao;
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(this.translocoService.translate('funcao.funcaoCarregadoSucesso'), this.translocoService.translate('global.fechar'), { duration: 2000 });
      },
      error: (err) => {
        console.error(this.translocoService.translate('funcao.erroCarregar'), err);
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(this.translocoService.translate('funcao.erroCarregaConexao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
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
          console.error(this.translocoService.translate('funcaos.erroCarregarEdicao'), err);
          this.loading = false;
          this.cdr.detectChanges();
          this.snackBar.open(this.translocoService.translate('funcaos.erroCarregarEdicao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          this.cancelForm();
        }
      });
    } else {
      this.funcaoForm.patchValue({
        descricao: funcao.descricao,
        observacao: funcao.observacao
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
          next: (updatedDept) => {
            this.snackBar.open(this.translocoService.translate('funcaos.autalizadoComSucesso'), this.translocoService.translate('global.fechar'), { duration: 3000 });
            this.cancelForm();
            this.loadfuncoes();
          },
          error: (err) => {
            console.error('Erro ao atualizar funcao:', err);
            this.snackBar.open(this.translocoService.translate('funcaos.erroAtualizar'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      } else {
        this.funcaoService.createFuncao(formData).subscribe({
          next: (newDept) => {
            this.snackBar.open('funcao criado com sucesso!', this.translocoService.translate('global.fechar'), { duration: 3000 });
            this.cancelForm();
            this.loadfuncoes();
          },
          error: (err) => {
            console.error(this.translocoService.translate('erroAoCriar'), err);
            this.snackBar.open(this.translocoService.translate('erroAoCriarConexao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      }
    } else {
      this.snackBar.open(this.translocoService.translate('funcaos.porFavorPreencha'), this.translocoService.translate('global.fechar'), { duration: 3000, panelClass: ['snackbar-warning'] });
    }
  }

  deletefuncao(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { title: this.translocoService.translate('funcao.confirmarExclusao'), message: this.translocoService.translate('funcao.mensagemExclusao')}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.funcaoService.deleteFuncao(id).subscribe({
          next: () => {
            this.snackBar.open(this.translocoService.translate('funcaos.excluidoComSucesso'), this.translocoService.translate('global.fechar'), { duration: 3000 });
            this.loadfuncoes();
          },
          error: (err) => {
            console.error(this.translocoService.translate('funcaos.erroAoExcluir'), err);
            this.snackBar.open(this.translocoService.translate('funcaos.erroAoExcluirConexao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
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
