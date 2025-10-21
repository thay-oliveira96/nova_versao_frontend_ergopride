import { Component, ChangeDetectorRef, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { AuthService } from '../../auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenav } from '@angular/material/sidenav';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { Subscription } from 'rxjs';

// Angular Material Modules
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';

// Define the NavItem interface to support children
export interface NavItem {
  name: string;
  nameKey: string;
  route?: string;
  icon: string;
  children?: NavItem[];
}

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
    MatFormFieldModule,
    MatExpansionModule,
    TranslocoModule
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class LayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('drawer') sidenav!: MatSidenav;

  mobileQuery: MediaQueryList;

  // Updated navItems with "Home" as flat and "Cadastro" with nested items
  navItems: NavItem[] = [
    { name: 'Home', nameKey: 'layout.menu.home', route: '/home', icon: 'home' }, // Flat item
    {
      name: ' Cadastro',
      nameKey: 'layout.menu.cadastro',
      icon: 'assignment',
      children: [
        { name: 'Departamentos', nameKey: 'layout.menu.departments', route: '/departamentos', icon: 'business' },
        { name: 'Empresas', nameKey: 'layout.menu.empresas', route: '/empresa', icon: 'business_center' },
        { name: 'Segmento Corporal', nameKey: 'layout.menu.segmentos', route: '/segmento', icon: 'accessibility_new' },
        { name: 'Objeto', nameKey: 'layout.menu.objeto', route: '/objeto', icon: 'view_in_ar' }
      ]
    }
  ];

  private _mobileQueryListener: () => void;

  activeLang: string;
  availableLangs = [
    { id: 'pt', label: 'Português' },
    { id: 'en', label: 'English' },
    { id: 'es', label: 'Español' }
  ];

  fullname: string | null = null;
  tipoPessoa: string | null = null;
  private fullnameSubscription!: Subscription;
  private tipoPessoaSubscription!: Subscription;

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
    this.fullnameSubscription = this.authService.getFullname().subscribe(fullname => {
      this.fullname = fullname;
    });

    this.tipoPessoaSubscription = this.authService.getTipoPessoa().subscribe(tipoPessoa => {
      this.tipoPessoa = tipoPessoa;
    });
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
    if (this.fullnameSubscription) {
      this.fullnameSubscription.unsubscribe();
    }
    if (this.tipoPessoaSubscription) {
      this.tipoPessoaSubscription.unsubscribe();
    }
  }

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

  closeSidenav(): void {
    if (this.mobileQuery.matches) {
      this.sidenav.close();
    }
  }

  /**
   * Verifica se o tipo de pessoa é 'F' (Física).
   * @returns true se o tipo de pessoa for 'F', caso contrário false.
   */
  verificaTipoPessoa(): boolean {
    return this.tipoPessoa === 'F';
  }
}