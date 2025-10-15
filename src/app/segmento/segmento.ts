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
import { SegmentoDTO } from '../models/segmento.model';
import { filter, Subscription, switchMap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../auth/auth.service';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { SegmentoService } from '../services/segmento.service';

@Component({
  selector: 'app-segmento',
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
  templateUrl: './segmento.html',
  styleUrl: './segmento.scss'
})
export class SegmentoComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  segmentos: SegmentoDTO[] = [];
  loading = false;
  showForm = false;
  editingId: number | null = null;
  
  segmentoForm: FormGroup;
  displayedColumns: string[] = ['id', 'descricao', 'observacao', 'acoes'];
  dataSource = new MatTableDataSource<SegmentoDTO>([]);

  public canDelete: boolean = false;
  private authSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private SegmentoService: SegmentoService,
    private cdr: ChangeDetectorRef,
    private translocoService: TranslocoService,
    private authService: AuthService
  ) {
    this.segmentoForm = this.fb.group({
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

      // Carrega os Segmentos apenas depois que o login é confirmado
      this.loadSegmentos();
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
   * Carrega a lista de Segmentos da API.
   */
  loadSegmentos(): void {
    this.loading = true;
    this.SegmentoService.getAllSegmentos().subscribe({
      next: (data) => {
        this.segmentos = data;
        this.dataSource.data = this.segmentos;
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(this.translocoService.translate('segmento.segmentoCarregadoSucesso'), this.translocoService.translate('global.fechar'), { duration: 2000 });
      },
      error: (err) => {
        console.error(this.translocoService.translate('segmento.erroCarregar'), err);
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(this.translocoService.translate('segmento.erroCarregaConexao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
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
    this.segmentoForm.reset();
  }

  showEditForm(Segmento: SegmentoDTO): void {
    this.showForm = true;
    this.editingId = Segmento.id || null;
    
    if (Segmento.id) {
      this.loading = true;
      this.SegmentoService.getSegmentoById(Segmento.id).subscribe({
        next: (data) => {
          this.segmentoForm.patchValue({
            descricao: data.descricao,
            observacao: data.observacao
          });
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(this.translocoService.translate('Segmentos.erroCarregarEdicao'), err);
          this.loading = false;
          this.cdr.detectChanges();
          this.snackBar.open(this.translocoService.translate('Segmentos.erroCarregarEdicao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          this.cancelForm();
        }
      });
    } else {
      this.segmentoForm.patchValue({
        descricao: Segmento.descricao,
        observacao: Segmento.observacao
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.segmentoForm.reset();
  }

  onSubmit(): void {
    if (this.segmentoForm.valid) {
      const formData: SegmentoDTO = this.segmentoForm.value;
      
      if (this.editingId) {
        this.SegmentoService.updateSegmento(this.editingId, formData).subscribe({
          next: (updatedDept) => {
            this.snackBar.open(this.translocoService.translate('Segmentos.autalizadoComSucesso'), this.translocoService.translate('global.fechar'), { duration: 3000 });
            this.cancelForm();
            this.loadSegmentos();
          },
          error: (err) => {
            console.error('Erro ao atualizar Segmento:', err);
            this.snackBar.open(this.translocoService.translate('Segmentos.erroAtualizar'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      } else {
        this.SegmentoService.createSegmento(formData).subscribe({
          next: (newDept) => {
            this.snackBar.open('Segmento criado com sucesso!', this.translocoService.translate('global.fechar'), { duration: 3000 });
            this.cancelForm();
            this.loadSegmentos();
          },
          error: (err) => {
            console.error(this.translocoService.translate('erroAoCriar'), err);
            this.snackBar.open(this.translocoService.translate('erroAoCriarConexao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      }
    } else {
      this.snackBar.open(this.translocoService.translate('Segmentos.porFavorPreencha'), this.translocoService.translate('global.fechar'), { duration: 3000, panelClass: ['snackbar-warning'] });
    }
  }

  deleteSegmento(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { title: this.translocoService.translate('segmento.confirmarExclusao'), message: this.translocoService.translate('segmento.mensagemExclusao')}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.SegmentoService.deleteSegmento(id).subscribe({
          next: () => {
            this.snackBar.open(this.translocoService.translate('Segmentos.excluidoComSucesso'), this.translocoService.translate('global.fechar'), { duration: 3000 });
            this.loadSegmentos();
          },
          error: (err) => {
            console.error(this.translocoService.translate('Segmentos.erroAoExcluir'), err);
            this.snackBar.open(this.translocoService.translate('Segmentos.erroAoExcluirConexao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.segmentoForm.get(controlName);
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
