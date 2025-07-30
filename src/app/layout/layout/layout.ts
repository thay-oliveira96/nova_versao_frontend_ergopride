import { Component, ChangeDetectorRef, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core'; // Adicione AfterViewInit
import { MediaMatcher } from '@angular/cdk/layout';
import { AuthService } from '../../auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenav } from '@angular/material/sidenav'; // Já existe
import { TranslocoService, TranslocoModule } from '@jsverse/transloco'; // Importe TranslocoModule também!

// Angular Material Modules
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field'; // MatFormFieldModule é necessário para mat-select

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSelectModule,
    MatFormFieldModule, // Garanta que este módulo está aqui
    TranslocoModule // MUITO IMPORTANTE: Adicione o TranslocoModule para que o pipe funcione!
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class LayoutComponent implements OnInit, OnDestroy, AfterViewInit { // Implemente AfterViewInit
  @ViewChild('drawer') sidenav!: MatSidenav; // O `!` é para dizer ao TypeScript que será inicializado

  mobileQuery: MediaQueryList;

  navItems = [
    { name: 'Home', nameKey: 'layout.menu.home', route: '/home', icon: 'home' },
    { name: 'Departamentos', nameKey: 'layout.menu.departments', route: '/departamentos', icon: 'business' }
  ];

  private _mobileQueryListener: () => void;

  activeLang: string;
  availableLangs = [
    { id: 'pt', label: 'Português' },
    { id: 'en', label: 'English' },
    { id: 'es', label: 'Español' }
  ];

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private authService: AuthService,
    private router: Router,
    private translocoService: TranslocoService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.activeLang = this.translocoService.getActiveLang();
  }

  ngOnInit(): void {
    // Lógica de inicialização se necessária
  }

  ngAfterViewInit(): void {
    // Certifique-se de que o sidenav está disponível após a inicialização da view
    // if (this.sidenav) {
    //   console.log('Sidenav is available');
    // }
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  // Método para toggle do sidenav (chamado pelo botão do toolbar)
  toggleSidenav(): void {
    this.sidenav.toggle();
  }

  logout(): void {
    this.authService.logout();
  }

  changeLanguage(lang: string): void {
    this.translocoService.setActiveLang(lang);
    this.activeLang = lang;
  }
}