import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list'; // Importação do MatListModule
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule // Adicionado ao array de imports
  ],
  templateUrl: './my-account-component.html',
  styleUrl: './my-account-component.scss'
})
export class MyAccountComponent implements OnInit {
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