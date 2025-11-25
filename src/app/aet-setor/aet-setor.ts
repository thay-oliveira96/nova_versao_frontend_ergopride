// src/app/aet-setor/aet-setor.ts

import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AetSetorDTO } from '../models/aet-setor.model';
import { DepartamentoDTO } from '../models/departamento.model';
import { AetEmpresaDTO } from '../models/aet-empresa.model';
import { EmpresaDTO } from '../models/empresa.model';

import { AetSetorService } from '../services/aet-setor.service';
import { DepartamentoService } from '../services/departamento.service';
import { AetEmpresaService } from '../services/aet-empresa.service';
import { EmpresaService } from '../services/empresa.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-aet-setor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    TranslocoModule
  ],
  templateUrl: './aet-setor.html',
  styleUrl: './aet-setor.scss'
})
export class AetSetorComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  aetEmpresaId!: number;
  empresaNome: string = 'Carregando...';

  loading = false;
  showForm = false;
  editingId: number | null = null;

  setorForm: FormGroup;
  displayedColumns: string[] = ['id', 'departamento', 'jornadaTrabalho', 'ritmoTrabalho', 'acoes'];
  dataSource = new MatTableDataSource<AetSetorDTO>([]);

  departamentos: DepartamentoDTO[] = [];
  public canDelete = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private translocoService: TranslocoService,
    private aetSetorService: AetSetorService,
    private departamentoService: DepartamentoService,
    private aetEmpresaService: AetEmpresaService,    // Novo
    private empresaService: EmpresaService,          // Novo
    private authService: AuthService
  ) {
    this.setorForm = this.fb.group({
      departamentosId: ['', Validators.required],
      jornadaTrabalho: ['', Validators.required],
      ritmoTrabalho: ['', Validators.required],
      rotatividadeAtividades: [''],
      necessidadesFisiologicas: [''],
      fatoresPsicossociais: [''],
      micropausas: [''],
      ruido: [''],
      temperatura: [''],
      artificial: [''],
      tiposLuminarias: [''],
      direcionalidade: [''],
      cintilacao: [''],
      ofuscamento: [''],
      natural: [''],
      lampadas: [''],
      aparenciaCorContraste: [''],
      efeitoEstroboscopio: [''],
      sombrasExcessivas: ['']
    });
  }

  ngOnInit(): void {
    this.aetEmpresaId = +this.route.snapshot.paramMap.get('aetEmpresaId')!;
    if (!this.aetEmpresaId || isNaN(this.aetEmpresaId)) {
      this.router.navigate(['/aet-empresa']);
      return;
    }

    this.carregarNomeEmpresa();     // Carrega o nome da empresa
    this.loadDepartamentos();
    this.loadAetSetores();

    this.authService.getUserRole().subscribe(role => {
      this.canDelete = role !== 'APPROVER';
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;

    // Custom filter predicate
    this.dataSource.filterPredicate = (data: AetSetorDTO, filter: string) => {
      const dataStr = 
        this.getDepartamentoNome(data.departamentosId) +
        data.jornadaTrabalho +
        data.ritmoTrabalho;
      return dataStr.toLowerCase().includes(filter);
    };
  }

  // MÉTODO NOVO: Busca o nome da empresa via AET → Empresa
  private carregarNomeEmpresa(): void {
    this.aetEmpresaService.getAetEmpresaById(this.aetEmpresaId).subscribe({
      next: (aetEmpresa: AetEmpresaDTO) => {
        if (aetEmpresa?.empresaId) {
          this.empresaService.getEmpresaById(aetEmpresa.empresaId).subscribe({
            next: (empresa: EmpresaDTO) => {
              this.empresaNome = empresa.nome || 'Empresa sem nome';
              this.cdr.detectChanges();
            },
            error: () => this.empresaNome = 'Erro ao carregar empresa'
          });
        } else {
          this.empresaNome = 'Empresa não vinculada';
        }
      },
      error: () => {
        this.empresaNome = 'AET não encontrada';
      }
    });
  }

  loadDepartamentos(): void {
    this.departamentoService.getAllDepartamentos().subscribe({
      next: (data) => {
        this.departamentos = data;
        this.cdr.detectChanges();
      },
      error: () => this.snackBar.open('Erro ao carregar departamentos', 'OK', { duration: 5000 })
    });
  }

  loadAetSetores(): void {
    this.loading = true;
    this.aetSetorService.getAllAetSetores(this.aetEmpresaId).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar setores', 'OK', { duration: 5000, panelClass: ['snackbar-error'] });
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  showCreateForm(): void {
    this.showForm = true;
    this.editingId = null;
    this.setorForm.reset();
  }

  showEditForm(setor: AetSetorDTO): void {
    this.showForm = true;
    this.editingId = setor.id || null;
    this.setorForm.patchValue(setor);
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.setorForm.reset();
  }

  onSubmit(): void {
    if (this.setorForm.invalid) {
      this.snackBar.open('Preencha todos os campos obrigatórios', 'OK', { duration: 4000 });
      return;
    }

    const formData: AetSetorDTO = {
      ...this.setorForm.value,
      aetempresaId: this.aetEmpresaId
    };

    if (this.editingId) {
      this.aetSetorService.updateAetSetor(this.editingId, formData).subscribe({
        next: () => {
          this.snackBar.open('Setor atualizado com sucesso!', 'OK', { duration: 3000 });
          this.cancelForm();
          this.loadAetSetores();
        },
        error: () => this.snackBar.open('Erro ao atualizar setor', 'OK', { duration: 5000, panelClass: ['snackbar-error'] })
      });
    } else {
      this.aetSetorService.createAetSetor(formData).subscribe({
        next: () => {
          this.snackBar.open('Setor criado com sucesso!', 'OK', { duration: 3000 });
          this.cancelForm();
          this.loadAetSetores();
        },
        error: () => this.snackBar.open('Erro ao criar setor', 'OK', { duration: 5000, panelClass: ['snackbar-error'] })
      });
    }
  }

  deleteAetSetor(id: number): void {
    if (confirm('Tem certeza que deseja excluir este setor?')) {
      this.aetSetorService.deleteAetSetor(id, this.aetEmpresaId).subscribe({
        next: () => {
          this.snackBar.open('Setor excluído com sucesso', 'OK', { duration: 3000 });
          this.loadAetSetores();
        },
        error: () => this.snackBar.open('Erro ao excluir', 'OK', { duration: 5000, panelClass: ['snackbar-error'] })
      });
    }
  }

  getDepartamentoNome(id: number): string {
    return this.departamentos.find(d => d.id === id)?.descricao || '—';
  }

  voltarParaAetEmpresa(): void {
    this.router.navigate(['/aet-empresa']);
  }

  abrirFuncao(aetEmpresaId: number, aetSetorId: number) {
    this.router.navigate(['/aet-empresa', aetEmpresaId, 'setor', aetSetorId, 'funcao']);
  }
}