import { inject } from '@angular/core';
// src/app/layouts/header/header.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  showUserMenu = false;
  showMobileMenu = false;
 public authService =inject(AuthService)
  public router = inject(Router)
  constructor(


  ) {}

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    document.body.classList.toggle('mobile-menu-open', this.showMobileMenu);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getUserInitials(): string {
    const fullName = this.authService.getUserFullName() || 'Guest';
    return fullName.split(' ').map((n:any) => n[0]).join('').toUpperCase();
  }
}
