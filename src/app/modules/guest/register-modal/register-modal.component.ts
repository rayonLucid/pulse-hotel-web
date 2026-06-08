// src/app/modules/guest/components/register-modal/register-modal.component.ts
import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GuestService } from '../../../core/services/guest.service';


@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.scss']
})
export class RegisterModalComponent {
  @Output() closeModal = new EventEmitter<boolean>();
  @Output() registrationSuccess = new EventEmitter<void>();
 @Output() showLoginModal = new EventEmitter<void>();
  private fb = inject(FormBuilder);
  private guestService = inject(GuestService);
  private toastr = inject(ToastrService);

  registerForm: FormGroup;
  isLoading = false;

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{8,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  register() {
    if (this.registerForm.invalid) {
      this.toastr.warning('Please fix the form errors');
      return;
    }

    this.isLoading = true;
    const { firstName, lastName, email, phoneNumber, password } = this.registerForm.value;

    this.guestService.register({ firstName, lastName, email, phoneNumber, password }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Registration successful! Logging you in...');
          // Auto-login after registration
          this.guestService.login(email, password).subscribe({
            next: (loginRes) => {
              if (loginRes.success) {
                this.toastr.success('Welcome!');
                this.registrationSuccess.emit();
                this.closeModal.emit(true);
              } else {
                this.toastr.error('Auto-login failed. Please login manually.');
                this.closeModal.emit(false);
              }
              this.isLoading = false;
            },
            error: () => {
              this.toastr.error('Auto-login failed. Please login manually.');
              this.isLoading = false;
              this.closeModal.emit(false);
            }
          });
        } else {
          this.toastr.error(res.message || 'Registration failed');
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Registration failed. Please try again.');
        this.isLoading = false;
      }
    });
  }

  close() {
    this.closeModal.emit(false);
  }
}
