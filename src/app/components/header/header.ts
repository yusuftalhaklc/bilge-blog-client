import { Component, inject, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthStateService } from '../../services/auth-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

  @ViewChild('userMenuTrigger') userMenuTrigger!: MatMenuTrigger;

  // Navigation items
  navItems = [
    { label: 'Home', route: '/home', icon: 'home' },
    { label: 'Categories', route: '/categories', icon: 'category' },
    { label: 'About', route: '/about', icon: 'info' },
  ];

  // Auth state signals
  readonly isAuthenticated = this.authState.isAuthenticated;
  readonly currentUser = this.authState.currentUser;
  readonly fullName = this.authState.fullName;
  
  // Menu open state
  readonly isMenuOpen = signal<boolean>(false);

  onMenuOpened(): void {
    this.isMenuOpen.set(true);
  }

  onMenuClosed(): void {
    this.isMenuOpen.set(false);
  }

  onLogout(): void {
    this.authState.clearAuthData();
    this.router.navigate(['/home']);
  }
}

