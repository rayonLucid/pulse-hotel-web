import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { GuestService } from '../services/guest.service';

@Injectable({ providedIn: 'root' })
export class GuestAuthGuard implements CanActivate {
  private guestService = inject(GuestService);
  private router = inject(Router);

  canActivate(): boolean {
    if (this.guestService.getGuestUser()) {
      return true;
    }
    this.router.navigate(['/guest/login']);
    return false;
  }
}
