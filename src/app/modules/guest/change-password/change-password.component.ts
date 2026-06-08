import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GuestService } from '../../../core/services/guest.service';


@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private guestService = inject(GuestService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  passwordForm: FormGroup;
  isSubmitting = false;

  constructor() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.invalid) {
      this.toastr.warning('Please correct the form errors');
      return;
    }

    this.isSubmitting = true;
    const payload = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.guestService.changePassword(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.toastr.success('Password changed successfully. Please login again.');
          this.guestService.logout(); // logout and redirect to login
          this.router.navigate(['/guest/login']);
        } else {
          this.toastr.error(res.message || 'Password change failed');
        }
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        this.toastr.error(err.error?.message || 'Failed to change password');
      }
    });
  }

  cancel() {
    this.router.navigate(['/guest/profile']);
  }
}
