// src/app/modules/auth/guest-login/guest-login.component.ts
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { GuestService } from '../../../core/services/guest.service';
import { AuthService } from '../../../core/auth/auth.service';
import { BookingStateService } from '../../../core/services/booking-state.service';

@Component({
  selector: 'app-guest-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guest-login.component.html',
  styleUrls: ['./guest-login.component.scss']
})
export class GuestLoginComponent {
  private guestService = inject(GuestService);
  private bookingState: BookingStateService =inject(BookingStateService)
  userService =inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  cdr = inject(ChangeDetectorRef);
  email = '';
  password = '';
  isLoading = false;
goToRegister(): void {
    this.router.navigate(['/guest/register']);
  }
  // login() {
  //   this.isLoading = true;
  //   this.guestService.login(this.email, this.password ).subscribe({
  //     next: (res) => {
  //       if (res.success) {
  //         this.toastr.success('Login successful');
  //         this.isLoading = false;
  //                 this.router.navigate(['/guest/dashboard']);
  //       } else {
  //         this.toastr.error(res.message || 'Login failed');
  //         this.isLoading = false;
  //         this.cdr.detectChanges();
  //       }
  //     },
  //     error: (error) => {
  //      // console.log(error)
  //       this.toastr.error(error.error.message || 'Invalid credentials'); this.isLoading = false; this.cdr.detectChanges();}
  //   });
  // }

  login() {
  this.guestService.login(this.email, this.password).subscribe({
    next: (res) => {
      if (res.success) {
        this.toastr.success('Login successful');
        // Redirect to booking wizard if there's a draft
        const draft = this.bookingState.getDraft();
        if (draft) {
          this.router.navigate(['/guest/bookings/new']);
        } else {
          this.router.navigate(['/guest/dashboard']);
        }
      } else {
        this.toastr.error(res.message || 'Login failed');
      }
    },
    error: () => this.toastr.error('Invalid credentials')
  });
}
}
