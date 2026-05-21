// src/app/modules/auth/components/register/register.component.ts
import { Component, signal, computed, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../app/core/auth/auth.service';
import { MenuService } from '../app/core/services/Menu.service';


interface PasswordRules {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
}
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

   // Password validation properties
  passwordLength = false;
  passwordUppercase = false;
  passwordLowercase = false;
  passwordNumber = false;

  // Error tracking
  serverErrors: { [key: string]: string[] } = {};
  generalError: string | null = null;
  fieldErrors: { [key: string]: string } = {};
  // Password validation signals
  passwordValue = signal('');
  // Method to check password validity
// ✅ Signals for individual rules (computed properties)

passwordValidRules = computed(() => ({
  length: this.passwordValue().length >= 6,
  uppercase: /[A-Z]/.test(this.passwordValue()),
  lowercase: /[a-z]/.test(this.passwordValue()),
  number: /[0-9]/.test(this.passwordValue())
}));

// ✅ Single method using computed rules
isPasswordValid(rule: keyof PasswordRules): boolean {
  return this.passwordValidRules()[rule];
}
 private authService = inject(AuthService);
 private menuService =inject(MenuService);
 private toastr = inject(ToastrService);
 private changeDetector = inject(ChangeDetectorRef);
  constructor(
    private fb: FormBuilder,

    private router: Router

  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });

    // Update password value signal for validation display
    this.registerForm.get('password')?.valueChanges.subscribe(value => {
      this.passwordValue.set(value || '');
    });
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

 onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.showValidationErrors();
      return;
    }

    this.isLoading = true;
    this.clearAllErrors();

   // const { confirmPassword, acceptTerms, ...registerData } = this.registerForm.value;

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.toastr.success('Account created successfully! Please login.', 'Registration Successful');
          this.router.navigate(['/auth/login']);
        }
      },
      error: (error) => {
        this.isLoading = false;
         this.toastr.error(error.message, 'Validation Error');
       // this.handleRegistrationError(error);
        this.changeDetector.detectChanges(); // Ensure UI updates with error messages
      }
    });
  }

  private handleRegistrationError(error: any): void {
   // console.error('Registration error:', error);

    // Handle different error scenarios
    if (error.status === 0) {
      this.generalError = 'Unable to connect to the server. Please check your internet connection.';
      this.toastr.error(this.generalError, 'Connection Error');
    }
    else if (error.status === 400 || error.status === 422) {
      // console.error('Validation errors:', error.message);
      // Validation errors from server
      if (error.message) {
        this.handleServerValidationErrors(error.message);
      } else if (error.error && error.error.message) {
        this.handleErrorMessage(error.error.message);
      } else {
        this.generalError = 'Invalid registration data. Please check your input.';
        this.toastr.error(this.generalError, 'Validation Error');
      }
    }
    else if (error.status === 409) {
      this.fieldErrors['email'] = 'An account with this email already exists. Please use a different email or login.';
      this.toastr .error(this.fieldErrors['email'], 'Email Already Exists');
      this.registerForm.get('email')?.reset();
    }
    else if (error.status === 500) {
      this.generalError = 'Server error. Please try again later.';
      this.toastr.error(this.generalError, 'Server Error');
    }
    else {
      this.generalError = error.message || 'An unexpected error occurred. Please try again.';
      this.toastr.error(this.generalError!, 'Registration Failed');
    }
  }

  private handleServerValidationErrors(errors: any): void {
    // Handle different error formats
    if (typeof errors === 'string') {
      console.error('Server error message:', errors);
      this.generalError = errors;
      this.toastr.error(errors, 'Validation Error');
      return;
    }

    // Map server field names to form control names
    const fieldMapping: { [key: string]: string } = {
      'FullName': 'fullName',
      'Email': 'email',
      'PhoneNumber': 'phoneNumber',
      'Password': 'password',
      'ConfirmPassword': 'confirmPassword'
    };

    let hasFieldErrors =   false;

    Object.keys(errors).forEach(key => {
      const formField = fieldMapping[key] || key.toLowerCase();
      const errorMessages = Array.isArray(errors[key]) ? errors[key] : [errors[key]];

      if (this.registerForm.get(formField)) {
        this.fieldErrors[formField] = errorMessages[0];
        hasFieldErrors = true;
      } else {
        this.serverErrors[key] = errorMessages;
      }
    });

    if (hasFieldErrors) {
      this.toastr.warning('Please correct the highlighted fields.', 'Validation Error');
    } else if (Object.keys(this.serverErrors).length > 0) {
      const firstError = Object.values(this.serverErrors)[0]?.[0];
      this.generalError = firstError || 'Please check your input and try again.';
      this.toastr.error(this.generalError, 'Validation Error');
    }
  }

  private handleErrorMessage(message: string): void {
    // Check for specific error messages
    if (message.toLowerCase().includes('email') && message.toLowerCase().includes('exists')) {
      this.fieldErrors['email'] = 'An account with this email already exists.';
    } else if (message.toLowerCase().includes('password')) {
      this.fieldErrors['password'] = message;
    } else if (message.toLowerCase().includes('phone')) {
      this.fieldErrors['phoneNumber'] = message;
    } else {
      this.generalError = message;
    }

    this.toastr.error(message, 'Registration Failed');
  }

  private showValidationErrors(): void {
    const controls = this.registerForm.controls;
    let firstErrorField = '';

    Object.keys(controls).forEach(field => {
      const control = controls[field];
      if (control.invalid && control.touched) {
        if (!firstErrorField) firstErrorField = field;

        if (control.errors?.['required']) {
          this.fieldErrors[field] = `${this.getFieldLabel(field)} is required`;
        } else if (control.errors?.['email']) {
          this.fieldErrors[field] = 'Please enter a valid email address';
        } else if (control.errors?.['minlength']) {
          const requiredLength = control.errors['minlength'].requiredLength;
          this.fieldErrors[field] = `${this.getFieldLabel(field)} must be at least ${requiredLength} characters`;
        } else if (control.errors?.['maxlength']) {
          const requiredLength = control.errors['maxlength'].requiredLength;
          this.fieldErrors[field] = `${this.getFieldLabel(field)} cannot exceed ${requiredLength} characters`;
        } else if (control.errors?.['pattern']) {
          if (field === 'phoneNumber') {
            this.fieldErrors[field] = 'Please enter a valid phone number (10-15 digits)';
          }
        }
      }
    });

    if (this.registerForm.hasError('mismatch')) {
      this.fieldErrors['confirmPassword'] = 'Passwords do not match';
    }

    if (this.registerForm.get('acceptTerms')?.invalid && this.registerForm.get('acceptTerms')?.touched) {
      this.fieldErrors['acceptTerms'] = 'You must accept the terms and conditions';
    }

    if (firstErrorField) {
      const element = document.querySelector(`[formControlName="${firstErrorField}"]`) as HTMLElement;
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }

    if (Object.keys(this.fieldErrors).length > 0) {
      this.toastr.warning('Please fix the errors before submitting.', 'Validation Error');
    }
  }

  private getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      fullName: 'Full Name',
      email: 'Email Address',
      phoneNumber: 'Phone Number',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      acceptTerms: 'Terms Acceptance'
    };
    return labels[field] || field;
  }

  private clearFieldError(field: string): void {
    delete this.fieldErrors[field];
  }

  private clearAllErrors(): void {
    this.serverErrors = {};
    this.fieldErrors = {};
    this.generalError = null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
