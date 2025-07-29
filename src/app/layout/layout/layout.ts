import { Component, ChangeDetectorRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { AuthService } from '../../auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenav } from '@angular/material/sidenav';

// Angular Material Modules
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

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
    MatMenuModule
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class LayoutComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') sidenav!: MatSidenav;
  
  mobileQuery: MediaQueryList;

  // Items do menu da barra lateral
  navItems = [
    { name: 'Home', route: '/home', icon: 'home' },
    { name: 'Departamentos', route: '/departamentos', icon: 'business' }
  ];

  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private authService: AuthService,
    private router: Router
  ) {
    // Configura o media query para detectar dispositivos móveis
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit(): void {
    // Pode adicionar lógica de inicialização aqui se necessário
  }

  ngOnDestroy(): void {
    // Remove o listener para evitar vazamento de memória
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  // Método para toggle do sidenav
  toggleSidenav(): void {
    this.sidenav.toggle();
  }

  // Método para logout
  logout(): void {
    this.authService.logout();
  }
}