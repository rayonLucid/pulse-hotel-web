// src/app/modules/auth/components/reset-password/reset-password.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../app/core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  token: string = '';
  email: string = '';
 private authService = Inject(AuthService)
  constructor(
    private fb: FormBuilder,

    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];
    this.email = this.route.snapshot.queryParams['email'];

    if (!this.token || !this.email) {
      this.toastr.error('Invalid reset link', 'Error');
      this.router.navigate(['/auth/login']);
    }
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.authService.resetPassword(
      this.token,
      this.email,
      this.resetForm.get('password')?.value
    ).subscribe({
      next: (response:any) => {
        this.isLoading = false;
        if (response.success) {
          this.toastr.success('Password reset successfully! Please login.', 'Success');
          this.router.navigate(['/auth/login']);
        } else {
          this.toastr.error(response.message || 'Reset failed', 'Error');
        }
      },
      error: (error:any) => {
        this.isLoading = false;
        this.toastr.error(error.message, 'Reset Failed');
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
