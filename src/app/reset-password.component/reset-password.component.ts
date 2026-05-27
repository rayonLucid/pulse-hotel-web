import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  resetForm: FormGroup;
  token: string = '';
  email: string = '';
  isLoading = false;
cdr = inject(ChangeDetectorRef)
  constructor() {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token')!;
      this.email = this.route.snapshot.queryParamMap.get('email')!;
    if(!this.token){
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.email = params['email'];
      if (!this.token) {

        this.toastr.error('Invalid reset link', 'Error');
        this.router.navigate(['/auth/login']);
      }
    });
  }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.resetForm.invalid) return;

    this.isLoading = true;
    const { password } = this.resetForm.value;

    this.authService.resetPassword(this.email, this.token, password).subscribe({
      next: (res) => {
        this.isLoading = false;
         this.cdr.detectChanges()
        this.toastr.success('Password reset successful! Please login.', 'Success');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges()
        this.toastr.error(err.message || 'Password reset failed', 'Error');
      }
    });
  }
}
