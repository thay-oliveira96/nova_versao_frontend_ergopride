import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
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
import { ObjetoService } from '../services/objeto.service';
import { ObjetosDTO } from '../models/objeto.model';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-objeto',
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
  templateUrl: './objeto.html',
  styleUrl: './objeto.scss'
})
export class ObjetoComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  objetos: ObjetosDTO[] = [];
  loading = false;
  showForm = false;
  editingId: number | null = null;
  canDelete = true;
  
  objetoForm: FormGroup;
  displayedColumns: string[] = ['id', 'descricao', 'observacao', 'acoes'];
  dataSource = new MatTableDataSource<ObjetosDTO>([]);

  totalElements: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private objetoService: ObjetoService,
    private cdr: ChangeDetectorRef,
    private translocoService: TranslocoService
  ) {
    this.objetoForm = this.fb.group({
      descricao: ['', [Validators.required, Validators.minLength(3)]],
      observacao: ['']
    });
  }
  
  ngOnInit(): void {
    this.loadObjetos();
  }

  ngOnDestroy(): void {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.cdr.detectChanges(); 
  }

  loadObjetos(): void {
    this.loading = true;
    this.objetoService.listObjetos(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.objetos = response.content;
        this.dataSource.data = this.objetos;
        this.totalElements = response.totalElements;
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(this.translocoService.translate('objeto.carregadoSucesso'), this.translocoService.translate('global.fechar'), { duration: 2000 });
      },
      error: (err) => {
        console.error(this.translocoService.translate('objeto.erroCarregar'), err);
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(this.translocoService.translate('objeto.erroCarregaConexao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
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
    this.loadObjetos();
  }

  showCreateForm(): void {
    this.showForm = true;
    this.editingId = null;
    this.objetoForm.reset();
  }

  showEditForm(objeto: ObjetosDTO): void {
    this.showForm = true;
    this.editingId = objeto.id || null;
    
    if (objeto.id) {
      this.loading = true;
      this.objetoService.getObjetoById(objeto.id).subscribe({
        next: (data) => {
          this.objetoForm.patchValue({
            descricao: data.descricao,
            observacao: data.observacao
          });
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(this.translocoService.translate('objeto.erroCarregarEdicao'), err);
          this.loading = false;
          this.cdr.detectChanges();
          this.snackBar.open(this.translocoService.translate('objeto.erroCarregarEdicao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          this.cancelForm();
        }
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.objetoForm.reset();
  }

  onSubmit(): void {
    if (this.objetoForm.valid) {
      const formData: ObjetosDTO = {
        ...this.objetoForm.value,
        usuario: '',
        dataAtualizacao: ''
      };
      
      if (this.editingId) {
        this.objetoService.updateObjeto(this.editingId, formData).subscribe({
          next: (updatedObjeto) => {
            this.snackBar.open(this.translocoService.translate('objeto.atualizadoSucesso'), this.translocoService.translate('global.fechar'), { duration: 3000 });
            this.cancelForm();
            this.loadObjetos();
          },
          error: (err) => {
            console.error('Erro ao atualizar objeto:', err);
            this.snackBar.open(this.translocoService.translate('objeto.erroAtualizar'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      } else {
        this.objetoService.createObjeto(formData).subscribe({
          next: (newObjeto) => {
            this.snackBar.open(this.translocoService.translate('objeto.criadoSucesso'), this.translocoService.translate('global.fechar'), { duration: 3000 });
            this.cancelForm();
            this.loadObjetos();
          },
          error: (err) => {
            console.error(this.translocoService.translate('objeto.erroCriar'), err);
            this.snackBar.open(this.translocoService.translate('objeto.erroCriarConexao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      }
    } else {
      this.snackBar.open(this.translocoService.translate('objeto.porFavorPreencha'), this.translocoService.translate('global.fechar'), { duration: 3000, panelClass: ['snackbar-warning'] });
    }
  }

  deleteObjeto(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { title: this.translocoService.translate('objeto.confirmarExclusao'), message: this.translocoService.translate('objeto.mensagemExclusao')}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.objetoService.deleteObjeto(id).subscribe({
          next: () => {
            this.snackBar.open(this.translocoService.translate('objeto.excluidoSucesso'), this.translocoService.translate('global.fechar'), { duration: 3000 });
            this.loadObjetos();
          },
          error: (err) => {
            console.error(this.translocoService.translate('objeto.erroAoExcluir'), err);
            this.snackBar.open(this.translocoService.translate('objeto.erroAoExcluirConexao'), this.translocoService.translate('global.fechar'), { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.objetoForm.get(controlName);
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