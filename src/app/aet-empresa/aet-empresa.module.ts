// src/app/aet-empresa/aet-empresa.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AetEmpresaComponent } from './aet-empresa';
import { AetSetorComponent } from '../aet-setor/aet-setor'; // ajuste o caminho se necessário

const routes: Routes = [
  {
    path: '',
    component: AetEmpresaComponent
  },
  {
    path: ':aetEmpresaId/setor',
    component: AetSetorComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AetEmpresaModule { }