// src/app/aet-funcao/aet-funcao.ts
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

import { AetFuncaoService } from '../services/aet-funcao.service';
import { AetFuncaoDTO } from '../models/aet-funcao.model';
import { FuncaoDTO } from '../models/funcao.model';
import { ObjetosDTO } from '../models/objeto.model';
import { FuncaoService } from '../services/funcao.service';
import { ObjetoService } from '../services/objeto.service';
import { EmpresaService } from '../services/empresa.service';
import { AetEmpresaService } from '../services/aet-empresa.service';
import { AetSetorService } from '../services/aet-setor.service';
import { DepartamentoService } from '../services/departamento.service';

import { AetEmpresaDTO } from '../models/aet-empresa.model';
import { EmpresaDTO } from '../models/empresa.model';
import { AetSetorDTO } from '../models/aet-setor.model';
import { DepartamentoDTO } from '../models/departamento.model';
import { AuthService } from '../auth/auth.service';


@Component({
  selector: 'app-aet-funcao',
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
  templateUrl: './aet-funcao.html',
  styleUrls: ['./aet-funcao.scss']
})
export class AetFuncaoComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  aetEmpresaId!: number;
  aetSetorId!: number;
  empresaNome: string = 'Carregando...';
  setorNome: string = 'Carregando...';

  loading = false;
  showForm = false;
  editingId: number | null = null;
  
  funcaoForm: FormGroup;
  displayedColumns: string[] = ['id', 'funcao', 'postoTrabalho', 'acoes'];
  dataSource = new MatTableDataSource<AetFuncaoDTO>([]);

  funcoes: FuncaoDTO[] = [];
  objetos: ObjetosDTO[] = [];

  selectedFiles: { [key: string]: File } = {};
  imagePreviews: { [key: string]: string | ArrayBuffer | null } = {};


  public canDelete = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private translocoService: TranslocoService,
    private aetFuncaoService: AetFuncaoService,
    private funcaoService: FuncaoService,
    private objetoService: ObjetoService,
    private aetEmpresaService: AetEmpresaService,
    private empresaService: EmpresaService,
    private aetSetorService: AetSetorService,
    private departamentoService: DepartamentoService,
    private authService: AuthService
  ) {
    this.funcaoForm = this.fb.group({
      funcaoId: ['', Validators.required],
      descricaoTarefa: [''],
      servicoDesenvolvido: [''],
      postoTrabalho: ['', Validators.required],
      objeto1Id: [''],
      objeto2Id: [''],
      objeto3Id: [''],
      descricaoObjeto1: [''],
      descricaoObjeto2: [''],
      descricaoObjeto3: [''],
      analisePopulacaoTrabalhadora: [''],
      manifestacoesTrabalhadores: [''],
      cicloTrabalho: [''],
      descricaoDaAtividade: [''],
      preDiagnostico: [''],
      analiseSistematica: ['']
    });
  }

  ngOnInit(): void {
    this.aetEmpresaId = +this.route.snapshot.paramMap.get('aetEmpresaId')!;
    this.aetSetorId = +this.route.snapshot.paramMap.get('aetSetorId')!;

    if (!this.aetEmpresaId || !this.aetSetorId) {
      this.snackBar.open('IDs de empresa ou setor inválidos.', 'OK', { duration: 5000 });
      this.router.navigate(['/aet-empresa']);
      return;
    }

    this.loadHeaderData();
    this.loadDropdowns();
    this.loadAetFuncoes();

    this.authService.getUserRole().subscribe(role => {
      this.canDelete = role !== 'APPROVER';
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;

    // Custom filter predicate
    this.dataSource.filterPredicate = (data: AetFuncaoDTO, filter: string) => {
      const dataStr = 
        this.getFuncaoNome(data.funcaoId) +
        data.postoTrabalho;
      return dataStr.toLowerCase().includes(filter);
    };
  }

  loadHeaderData(): void {
    this.aetEmpresaService.getAetEmpresaById(this.aetEmpresaId).subscribe((aetEmpresa) => {
      this.empresaService.getEmpresaById(aetEmpresa.empresaId).subscribe((empresa) => {
        this.empresaNome = empresa.nome || 'Empresa não encontrada';
        this.cdr.detectChanges();
      });
    });

    this.aetSetorService.getAetSetorById(this.aetSetorId, this.aetEmpresaId).subscribe((aetSetor) => {
        this.departamentoService.getDepartamentoById(aetSetor.departamentosId).subscribe( departamento => {
            this.setorNome = departamento.descricao || 'Setor não encontrado';
            this.cdr.detectChanges();
        })
    });
  }

  loadDropdowns(): void {
    this.funcaoService.getAllFuncoes().subscribe((data) => this.funcoes = data.content);
    this.objetoService.listObjetos(0, 100).subscribe((data) => this.objetos = data.content);
  }

  loadAetFuncoes(): void {
    this.loading = true;
    this.aetFuncaoService.getAllAetFuncoes(this.aetEmpresaId, this.aetSetorId).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar funções.', 'OK', { duration: 5000, panelClass: ['snackbar-error'] });
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
    this.funcaoForm.reset();
    this.clearPreviews();
  }

  showEditForm(funcao: AetFuncaoDTO): void {
    this.showForm = true;
    this.editingId = funcao.id || null;
    this.funcaoForm.patchValue(funcao);
    this.clearPreviews();
    this.imagePreviews['imagem1'] = funcao.imagem1Posto || null;
    this.imagePreviews['imagem2'] = funcao.imagem2Posto || null;
    this.imagePreviews['imagem3'] = funcao.imagem3Posto || null;
    this.imagePreviews['imagem4'] = funcao.imagem4Posto || null;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.funcaoForm.reset();
    this.clearPreviews();
  }

  onSubmit(): void {
    if (this.funcaoForm.invalid) {
      this.snackBar.open('Preencha os campos obrigatórios.', 'OK', { duration: 4000 });
      return;
    }

    const aetFuncao: AetFuncaoDTO = {
      ...this.funcaoForm.value,
      aetEmpresaId: this.aetEmpresaId,
      aetSetorId: this.aetSetorId
    };

    const operation = this.editingId
      ? this.aetFuncaoService.updateAetFuncao(this.editingId, this.aetEmpresaId, this.aetSetorId, aetFuncao, this.selectedFiles)
      : this.aetFuncaoService.createAetFuncao(aetFuncao, this.selectedFiles);

    operation.subscribe({
      next: () => {
        const message = this.editingId ? 'Função atualizada com sucesso!' : 'Função criada com sucesso!';
        this.snackBar.open(message, 'OK', { duration: 3000 });
        this.cancelForm();
        this.loadAetFuncoes();
      },
      error: () => {
        const message = this.editingId ? 'Erro ao atualizar função.' : 'Erro ao criar função.';
        this.snackBar.open(message, 'OK', { duration: 5000, panelClass: ['snackbar-error'] });
      }
    });
  }

  deleteAetFuncao(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta função?')) {
      this.aetFuncaoService.deleteAetFuncao(id, this.aetEmpresaId, this.aetSetorId).subscribe({
        next: () => {
          this.snackBar.open('Função excluída com sucesso.', 'OK', { duration: 3000 });
          this.loadAetFuncoes();
        },
        error: () => this.snackBar.open('Erro ao excluir função.', 'OK', { duration: 5000, panelClass: ['snackbar-error'] })
      });
    }
  }

  onFileSelected(event: Event, fieldName: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFiles[fieldName] = file;
      const reader = new FileReader();
      reader.onload = e => this.imagePreviews[fieldName] = e.target?.result || null;
      reader.readAsDataURL(file);
    }
  }

  clearPreviews(): void {
    this.selectedFiles = {};
    this.imagePreviews = {};
  }

  getFuncaoNome(id: number): string {
    return this.funcoes.find(f => f.id === id)?.descricao || '—';
  }

  voltarParaSetores(): void {
    this.router.navigate(['/aet-empresa', this.aetEmpresaId, 'setor']);
  }
}