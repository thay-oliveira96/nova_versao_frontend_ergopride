import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Funcao } from './funcao';

const routes: Routes = [
  { path: '', component: Funcao }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FuncaoModule { } 