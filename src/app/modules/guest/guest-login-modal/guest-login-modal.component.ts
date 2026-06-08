// src/app/modules/guest/components/login-modal/login-modal.component.ts
import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GuestService } from '../../../core/services/guest.service';


@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl:'./guest-login-modal.component.html' ,
  styleUrl:'./guest-login-modal.component.scss'
})
export class LoginModalComponent {
  @Output() closeModal = new EventEmitter<boolean>();
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() showRegister = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private guestService = inject(GuestService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    const { email, password } = this.loginForm.value;
    this.guestService.login(email, password).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Login successful');
          this.loginSuccess.emit();
          this.closeModal.emit(true);
        } else {
          this.toastr.error(res.message || 'Login failed');
        }
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Invalid credentials');
        this.isLoading = false;
      }
    });
  }

  close() {
    this.closeModal.emit(false);
  }

  goToRegister() {
    this.router.navigate(['/guest/register'], { queryParams: { returnUrl: '/guest/bookings/new' } });
    this.closeModal.emit(false);
  }
}
