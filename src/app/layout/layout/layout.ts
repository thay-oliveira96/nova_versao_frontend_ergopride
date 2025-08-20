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

// A interface foi simplificada para remover a propriedade 'children'
export interface NavItem {
  name: string;
  nameKey: string;
  route?: string;
  icon: string;
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

  // A nova estrutura de dados para o menu, agora uma lista plana
  navItems: NavItem[] = [
    { name: 'Home', nameKey: 'layout.menu.home', route: '/home', icon: 'home' },
    { name: 'Departamentos', nameKey: 'layout.menu.departments', route: '/departamentos', icon: 'business' },
    // Adicione outros itens de cadastro aqui no futuro como itens separados
  ];

  private _mobileQueryListener: () => void;

  activeLang: string;
  availableLangs = [
    { id: 'pt', label: 'Português' },
    { id: 'en', label: 'English' },
    { id: 'es', label: 'Español' }
  ];

  fullname: string | null = null;
  private fullnameSubscription!: Subscription;

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
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
    if (this.fullnameSubscription) {
      this.fullnameSubscription.unsubscribe();
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
}