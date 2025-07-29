import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

// Angular Material Modules
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface Departamento {
  id?: number;
  nome: string;
  descricao: string;
  responsavel: string;
  dataCriacao?: Date;
}

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
    MatProgressSpinnerModule
  ],
  templateUrl: './departamento.html',
  styleUrl: './departamento.scss'
})
export class DepartamentoComponent implements OnInit {
  displayedColumns: string[] = ['nome', 'descricao', 'responsavel', 'dataCriacao', 'acoes'];
  dataSource = new MatTableDataSource<Departamento>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  departamentos: Departamento[] = [];
  loading = false;
  showForm = false;
  editingId: number | null = null;
  
  departamentoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.departamentoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      responsavel: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.loadDepartamentos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDepartamentos(): void {
    this.loading = true;
    // Simulate API call - replace with actual API endpoint
    setTimeout(() => {
      this.departamentos = [
        {
          id: 1,
          nome: 'Recursos Humanos',
          descricao: 'Departamento responsável pela gestão de pessoas',
          responsavel: 'Maria Silva',
          dataCriacao: new Date('2024-01-15')
        },
        {
          id: 2,
          nome: 'Tecnologia da Informação',
          descricao: 'Departamento de TI e desenvolvimento de sistemas',
          responsavel: 'João Santos',
          dataCriacao: new Date('2024-01-20')
        },
        {
          id: 3,
          nome: 'Financeiro',
          descricao: 'Departamento responsável pelas finanças da empresa',
          responsavel: 'Ana Costa',
          dataCriacao: new Date('2024-01-25')
        }
      ];
      this.dataSource.data = this.departamentos;
      this.loading = false;
    }, 1000);
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
    this.departamentoForm.reset();
  }

  showEditForm(departamento: Departamento): void {
    this.showForm = true;
    this.editingId = departamento.id || null;
    this.departamentoForm.patchValue({
      nome: departamento.nome,
      descricao: departamento.descricao,
      responsavel: departamento.responsavel
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.departamentoForm.reset();
  }

  onSubmit(): void {
    if (this.departamentoForm.valid) {
      const formData = this.departamentoForm.value;
      
      if (this.editingId) {
        // Update existing department
        const index = this.departamentos.findIndex(d => d.id === this.editingId);
        if (index !== -1) {
          this.departamentos[index] = {
            ...this.departamentos[index],
            ...formData
          };
          this.snackBar.open('Departamento atualizado com sucesso!', 'Fechar', { duration: 3000 });
        }
      } else {
        // Create new department
        const newDepartamento: Departamento = {
          id: Math.max(...this.departamentos.map(d => d.id || 0)) + 1,
          ...formData,
          dataCriacao: new Date()
        };
        this.departamentos.unshift(newDepartamento);
        this.snackBar.open('Departamento criado com sucesso!', 'Fechar', { duration: 3000 });
      }
      
      this.dataSource.data = [...this.departamentos];
      this.cancelForm();
    } else {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios.', 'Fechar', { duration: 3000 });
    }
  }

  deleteDepartamento(id: number): void {
    if (confirm('Tem certeza que deseja excluir este departamento?')) {
      this.departamentos = this.departamentos.filter(d => d.id !== id);
      this.dataSource.data = [...this.departamentos];
      this.snackBar.open('Departamento excluído com sucesso!', 'Fechar', { duration: 3000 });
    }
  }

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
