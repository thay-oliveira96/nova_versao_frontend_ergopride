import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-account-juridica',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './my-account-juridica-component.html',
  styleUrl: './my-account-juridica-component.scss'
})
export class MyAccountJuridicaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  cadastralForm!: FormGroup;

  userProfile = {
    nomeCompleto: 'João da Silva',
    email: 'joao.silva@exemplo.com',
    cpfCnpj: '123.456.789-00',
    telefone: '(11) 98765-4321'
  };

  planDetails = {
    planoAtual: 'Plano Premium',
    valor: 49.90,
    ciclo: 'Mensal',
    proximaRenovacao: '25/08/2026'
  };

  linkedUsers = [
    { nome: 'Maria Silva', email: 'maria.silva@exemplo.com', status: 'Ativo' },
    { nome: 'Pedro Souza', email: 'pedro.souza@exemplo.com', status: 'Inativo' }
  ];

  ngOnInit(): void {
    this.cadastralForm = this.fb.group({
      nomeCompleto: [{ value: this.userProfile.nomeCompleto, disabled: true }],
      email: [{ value: this.userProfile.email, disabled: true }],
      cpfCnpj: [{ value: this.userProfile.cpfCnpj, disabled: true }],
      telefone: [{ value: this.userProfile.telefone, disabled: true }]
    });
  }

  onEditProfile(): void {
    console.log('Botão de editar clicado.');
  }

  onSaveChanges(): void {
    console.log('Botão de salvar clicado.');
  }
}
