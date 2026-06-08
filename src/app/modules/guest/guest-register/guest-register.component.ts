import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GuestService } from '../../../core/services/guest.service';

@Component({
  selector: 'app-guest-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './guest-register.component.html',
  styleUrls: ['./guest-register.component.scss']
})
export class GuestRegisterComponent {
  private fb = inject(FormBuilder);
  private guestService = inject(GuestService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  isSubmitting = false;

  registerForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{8,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validator: this.passwordMatchValidator });

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }
goToLogin(){
    this.router.navigate(['/guest/login']);
}
  register() {
    if (this.registerForm.invalid) return;
    this.isSubmitting = true;
    const { firstName, lastName, email, phoneNumber, password } = this.registerForm.value;
    this.guestService.register({ firstName, lastName, email, phoneNumber, password }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Registration successful! Please login.');
          this.router.navigate(['/guest/login']);
        } else {
          this.toastr.error(res.message || 'Registration failed');
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Registration failed. Please try again.');
        this.isSubmitting = false;
      }
    });
  }
}
