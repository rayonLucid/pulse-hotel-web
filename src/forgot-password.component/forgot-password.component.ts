import { ChangeDetectionStrategy, ChangeDetectorRef, inject, Inject } from '@angular/core';
// src/app/modules/auth/components/forgot-password/forgot-password.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../app/core/auth/auth.service';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;
  isSubmitted = false;
//private authService= Inject(AuthService)
cdr =inject(ChangeDetectorRef)
  constructor(
    private fb: FormBuilder,
    private authService:AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.authService.forgotPassword(this.forgotForm.get('email')?.value).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.isSubmitted = true;
         this.cdr.detectChanges()
        this.toastr.success('Password reset link sent to your email!', 'Check Your Inbox');

      },
      error: (error: any) => {
        this.isLoading = false;
          this.cdr.detectChanges()
        console.log(error)
        this.toastr.error(error.error || error.error.message, 'Failed to send reset link');

      }
    });
  }

  backToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
