// src/app/departamento/departamento.component.ts

import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

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
import { TranslocoModule } from '@jsverse/transloco';

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
export class DepartamentoComponent implements OnInit, AfterViewInit {
  // Colunas a serem exibidas na tabela: id, descricao, observacao e acoes
  displayedColumns: string[] = ['id', 'descricao', 'observacao', 'acoes'];
  dataSource = new MatTableDataSource<DepartamentoDTO>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  departamentos: DepartamentoDTO[] = [];
  loading = false;
  showForm = false;
  editingId: number | null = null;
  
  departamentoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private departamentoService: DepartamentoService,
    private cdr: ChangeDetectorRef
  ) {
    // Inicializa o formulário com os novos campos: descricao e observacao
    this.departamentoForm = this.fb.group({
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      observacao: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.loadDepartamentos();
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
        setTimeout(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }, 0);
        this.snackBar.open('Departamentos carregados com sucesso!', 'Fechar', { duration: 2000 });
      },
      error: (err) => {
        console.error('Erro ao carregar departamentos:', err);
        setTimeout(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }, 0);
        this.snackBar.open('Erro ao carregar departamentos. Verifique sua conexão ou permissões.', 'Fechar', { duration: 5000, panelClass: ['snackbar-error'] });
      }
    });
  }

  /**
   * Aplica filtro na tabela de departamentos.
   * @param event Evento de digitação no campo de busca.
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Exibe o formulário para criar um novo departamento.
   */
  showCreateForm(): void {
    this.showForm = true;
    this.editingId = null;
    this.departamentoForm.reset();
  }

  /**
   * Exibe o formulário para editar um departamento existente.
   * @param departamento O departamento a ser editado.
   */
  showEditForm(departamento: DepartamentoDTO): void {
    this.showForm = true;
    this.editingId = departamento.id || null;
    
    if (departamento.id) {
      this.loading = true;
      this.departamentoService.getDepartamentoById(departamento.id).subscribe({
        next: (data) => {
          this.departamentoForm.patchValue({ // Preenche o formulário com os dados
            descricao: data.descricao,
            observacao: data.observacao
          });
          setTimeout(() => {
            this.loading = false;
            this.cdr.detectChanges();
          }, 0);
        },
        error: (err) => {
          console.error('Erro ao carregar departamento para edição:', err);
          setTimeout(() => {
            this.loading = false;
            this.cdr.detectChanges();
          }, 0);
          this.snackBar.open('Erro ao carregar dados para edição.', 'Fechar', { duration: 5000, panelClass: ['snackbar-error'] });
          this.cancelForm();
        }
      });
    } else {
      // Caso o departamento não tenha ID (não deveria acontecer em edição de item existente),
      // apenas preenche com os dados passados.
      this.departamentoForm.patchValue({
        descricao: departamento.descricao,
        observacao: departamento.observacao
      });
    }
  }

  /**
   * Cancela a exibição do formulário e limpa-o.
   */
  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.departamentoForm.reset();
  }

  /**
   * Envia o formulário para criar ou atualizar um departamento.
   */
  onSubmit(): void {
    if (this.departamentoForm.valid) {
      const formData: DepartamentoDTO = this.departamentoForm.value;
      
      if (this.editingId) {
        // Lógica para atualizar departamento existente
        this.departamentoService.updateDepartamento(this.editingId, formData).subscribe({
          next: (updatedDept) => {
            this.snackBar.open('Departamento atualizado com sucesso!', 'Fechar', { duration: 3000 });
            this.cancelForm();
            this.loadDepartamentos(); // Recarrega a lista para refletir a atualização
          },
          error: (err) => {
            console.error('Erro ao atualizar departamento:', err);
            this.snackBar.open('Erro ao atualizar departamento. Verifique os dados ou permissões.', 'Fechar', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      } else {
        // Lógica para criar novo departamento
        this.departamentoService.createDepartamento(formData).subscribe({
          next: (newDept) => {
            this.snackBar.open('Departamento criado com sucesso!', 'Fechar', { duration: 3000 });
            this.cancelForm();
            this.loadDepartamentos(); // Recarrega a lista para mostrar o novo departamento
          },
          error: (err) => {
            console.error('Erro ao criar departamento:', err);
            this.snackBar.open('Erro ao criar departamento. Verifique os dados ou permissões.', 'Fechar', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      }
    } else {
      // Exibe mensagem se o formulário for inválido
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios e válidos.', 'Fechar', { duration: 3000, panelClass: ['snackbar-warning'] });
    }
  }

  /**
   * Exclui um departamento após confirmação.
   * @param id ID do departamento a ser excluído.
   */
  deleteDepartamento(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { title: 'Confirmar Exclusão', message: 'Tem certeza que deseja excluir este departamento?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.departamentoService.deleteDepartamento(id).subscribe({
          next: () => {
            this.snackBar.open('Departamento excluído com sucesso!', 'Fechar', { duration: 3000 });
            this.loadDepartamentos();
          },
          error: (err) => {
            console.error('Erro ao excluir departamento:', err);
            this.snackBar.open('Erro ao excluir departamento. Tente novamente.', 'Fechar', { duration: 5000, panelClass: ['snackbar-error'] });
          }
        });
      }
    });
  }

  /**
   * Retorna a mensagem de erro para um controle de formulário.
   * @param controlName Nome do controle do formulário.
   */
  getErrorMessage(controlName: string): string {
    const control = this.departamentoForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.getError('minlength').requiredLength;
      return `Mínimo de ${requiredLength} caracteres`;
    }
    return '';
  }
}