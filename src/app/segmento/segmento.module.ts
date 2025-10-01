import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SegmentoComponent } from './segmento';

const routes: Routes = [
  { path: '', component: SegmentoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SegmentoModule { } 