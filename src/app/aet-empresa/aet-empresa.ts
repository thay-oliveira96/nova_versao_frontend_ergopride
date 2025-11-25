// src/app/aet-empresa/aet-empresa.ts

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
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AetEmpresaDTO } from '../models/aet-empresa.model';
import { EmpresaDTO } from '../models/empresa.model';
import { filter, Subscription, switchMap, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AetEmpresaService } from '../services/aet-empresa.service';
import { EmpresaService } from '../services/empresa.service';
import { AuthService } from '../auth/auth.service';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-aet-empresa',
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
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    TranslocoModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './aet-empresa.html',
  styleUrl: './aet-empresa.scss'
})
export class AetEmpresaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  aetEmpresas: AetEmpresaDTO[] = [];
  empresas: EmpresaDTO[] = [];
  loading = false;
  showForm = false;
  editingId: number | null = null;

  aetEmpresaForm: FormGroup;
  displayedColumns: string[] = ['id', 'empresa', 'dataAbertura', 'status', 'dataFechamento', 'acoes'];
  dataSource = new MatTableDataSource<AetEmpresaDTO>([]);

  public canDelete: boolean = false;
  private authSubscription!: Subscription;

  // Filtro de pesquisa no combo
  empresaFilterCtrl = new FormControl('');
  filteredEmpresas: EmpresaDTO[] = [];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private aetEmpresaService: AetEmpresaService,
    private empresaService: EmpresaService,
    private cdr: ChangeDetectorRef,
    private translocoService: TranslocoService,
    private authService: AuthService,
    private router: Router
  ) {
    this.aetEmpresaForm = this.fb.group({
      empresaId: ['', Validators.required],
      dataAbertura: ['', Validators.required],
      status: ['', Validators.required],
      dataFechamento: ['']
    });
  }

  ngOnInit(): void {
    this.loadEmpresas();
    this.setupEmpresaFilter();

    this.authSubscription = this.authService.isLoggedIn().pipe(
      filter(isLoggedIn => isLoggedIn),
      switchMap(() => this.authService.getUserRole())
    ).subscribe({
      next: role => {
        this.canDelete = role !== 'APPROVER';
        this.loadAetEmpresas();
      },
      error: () => this.loadAetEmpresas()
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Custom filter predicate
    this.dataSource.filterPredicate = (data: AetEmpresaDTO, filter: string) => {
      const dataStr = this.getEmpresaNome(data.empresaId) + data.status;
      return dataStr.toLowerCase().includes(filter);
    };
    
    this.cdr.detectChanges();
  }

  loadEmpresas(): void {
    this.empresaService.getAllEmpresas(0, 100).subscribe({
      next: (response) => {
        this.empresas = response.content;
        this.filteredEmpresas = [...this.empresas];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar empresas:', err);
      }
    });
  }

  setupEmpresaFilter(): void {
    this.empresaFilterCtrl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(search => {
        this.filteredEmpresas = this._filterEmpresas(search || '');
      });
  }

  private _filterEmpresas(value: string): EmpresaDTO[] {
    const filterValue = value.toLowerCase();
    return this.empresas.filter(empresa =>
      empresa.nome?.toLowerCase().includes(filterValue) ||
      empresa.cnpj?.toLowerCase().includes(filterValue)
    );
  }

  displayEmpresa(empresa: EmpresaDTO): string {
    return empresa && empresa.nome ? `${empresa.nome} (${empresa.cnpj})` : '';
  }

  loadAetEmpresas(): void {
    this.loading = true;
    this.aetEmpresaService.getAllAetEmpresas().subscribe({
      next: (data) => {
        this.aetEmpresas = data;
        this.dataSource.data = [...this.aetEmpresas];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(
          this.translocoService.translate('aetEmpresa.erroCarregar'),
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

  showCreateForm(): void {
    this.showForm = true;
    this.editingId = null;
    this.aetEmpresaForm.reset();
  }

  showEditForm(aetEmpresa: AetEmpresaDTO): void {
    this.showForm = true;
    this.editingId = aetEmpresa.id || null;
  
    if (aetEmpresa.id) {
      this.loading = true;
      this.aetEmpresaService.getAetEmpresaById(aetEmpresa.id).subscribe({
        next: (data) => {
          this.aetEmpresaForm.patchValue({
            empresaId: data.empresaId,
            dataAbertura: data.dataAbertura ? data.dataAbertura.split('T')[0] : '',
            status: data.status,
            dataFechamento: data.dataFechamento ? data.dataFechamento.split('T')[0] : ''
          });
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cancelForm();
        }
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.aetEmpresaForm.reset();
  }

  onSubmit(): void {
    if (this.aetEmpresaForm.valid) {
      // Clona os valores do form
      let formData: AetEmpresaDTO = { ...this.aetEmpresaForm.value };
  
      // Converte as datas para LocalDateTime (ISO com hora 00:00:00)
      const toLocalDateTime = (dateStr: string): string => {
        if (!dateStr) return null as any;
        return `${dateStr}T00:00:00`; // ou T12:00:00 se preferir meio-dia
      };
  
      formData.dataAbertura = toLocalDateTime(formData.dataAbertura);
      if (formData.dataFechamento) {
        formData.dataFechamento = toLocalDateTime(formData.dataFechamento);
      }
  
      if (this.editingId) {
        this.aetEmpresaService.updateAetEmpresa(this.editingId, formData).subscribe({
          next: () => {
            this.snackBar.open(
              this.translocoService.translate('aetEmpresa.atualizadoComSucesso'),
              this.translocoService.translate('global.fechar'),
              { duration: 3000 }
            );
            this.cancelForm();
            this.loadAetEmpresas();
          },
          error: (err) => {
            console.error('Erro ao atualizar:', err);
            this.snackBar.open(
              this.translocoService.translate('aetEmpresa.erroAtualizar'),
              this.translocoService.translate('global.fechar'),
              { duration: 5000, panelClass: ['snackbar-error'] }
            );
          }
        });
      } else {
        this.aetEmpresaService.createAetEmpresa(formData).subscribe({
          next: () => {
            this.snackBar.open(
              this.translocoService.translate('aetEmpresa.criadoComSucesso'),
              this.translocoService.translate('global.fechar'),
              { duration: 3000 }
            );
            this.cancelForm();
            this.loadAetEmpresas();
          },
          error: (err) => {
            console.error('Erro ao criar:', err);
            this.snackBar.open(
              this.translocoService.translate('aetEmpresa.erroCriar'),
              this.translocoService.translate('global.fechar'),
              { duration: 5000, panelClass: ['snackbar-error'] }
            );
          }
        });
      }
    } else {
      this.snackBar.open(
        this.translocoService.translate('aetEmpresa.preenchaCampos'),
        this.translocoService.translate('global.fechar'),
        { duration: 3000, panelClass: ['snackbar-warning'] }
      );
    }
  }

  deleteAetEmpresa(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {
        title: this.translocoService.translate('aetEmpresa.confirmarExclusao'),
        message: this.translocoService.translate('aetEmpresa.mensagemExclusao')
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.aetEmpresaService.deleteAetEmpresa(id).subscribe({
          next: () => {
            this.snackBar.open(
              this.translocoService.translate('aetEmpresa.excluidoComSucesso'),
              this.translocoService.translate('global.fechar'),
              { duration: 3000 }
            );
            this.loadAetEmpresas();
          },
          error: () => {
            this.snackBar.open(
              this.translocoService.translate('aetEmpresa.erroExcluir'),
              this.translocoService.translate('global.fechar'),
              { duration: 5000, panelClass: ['snackbar-error'] }
            );
          }
        });
      }
    });
  }

  // Ação temporária
  abrirAetSetor(aetEmpresaId: number): void {
    this.router.navigate(['/aet-empresa', aetEmpresaId, 'setor']);
  }

  abrirRelatorio(): void {
    this.snackBar.open('Relatório em desenvolvimento', 'OK', { duration: 3000 });
  }

  // src/app/aet-empresa/aet-empresa.ts

// ... dentro da classe AetEmpresaComponent

getEmpresaNome(empresaId: number | undefined): string {
  if (!empresaId) return '—';
  const empresa = this.empresas.find(e => e.id === empresaId);
  return empresa ? `${empresa.nome} (${empresa.cnpj})` : '—';
}

trackByEmpresaId(index: number, empresa: EmpresaDTO): number {
  return empresa.id!;
}

  getErrorMessage(controlName: string): string {
    const control = this.aetEmpresaForm.get(controlName);
    if (control?.hasError('required')) {
      return this.translocoService.translate('errosGlobais.campoObrigatorio');
    }
    return '';
  }
}