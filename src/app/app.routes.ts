import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { LayoutComponent } from './layout/layout/layout';
import { AuthGuard } from './auth/auth.guard';
import { HomeComponent } from './home/home/home';
import { PublicRegistration } from './public-registration/public-registration';
import { PublicRegistrationValidationComponent } from './public-registration-validation/public-registration-validation';
import { MyAccountComponent } from './my-account-component/my-account-component';
import { MyAccountJuridicaComponent } from './my-account-juridica-component/my-account-juridica-component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: PublicRegistration },
  { path: 'validate-registration', component: PublicRegistrationValidationComponent },
  { path: 'my-account', component: MyAccountComponent},
  { path: 'my-account-juridica', component: MyAccountJuridicaComponent},
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'departamentos', loadChildren: () => import('./departamento/departamento.module').then(m => m.DepartamentoModule) },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];