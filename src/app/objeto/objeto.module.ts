import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ObjetoComponent } from './objeto';

const routes: Routes = [
  { path: '', component: ObjetoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class objetotoModule { } 