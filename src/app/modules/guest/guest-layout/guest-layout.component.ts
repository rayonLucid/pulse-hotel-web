import { StaffCurrentStatusDto } from './../../../core/models/staff.model';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { GuestService } from '../../../core/services/guest.service';

@Component({
  selector: 'app-guest-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './guest-layout.component.html',
  styleUrls: ['./guest-layout.component.scss']
})
export class GuestLayoutComponent {
  private guestService = inject(GuestService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  isMobileMenuOpen = false;
currentYear = new Date().getFullYear();
  getUserName(): string {
    const user = this.guestService.getGuestUser();
    return user ? `${user.firstName} ${user.lastName}` : 'Guest';
  }

  logout() {
    this.guestService.logout();
    this.toastr.info('You have been logged out.');
    this.router.navigate(['/guest/login']);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
