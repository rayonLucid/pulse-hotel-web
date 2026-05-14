// src/app/modules/auth/components/login/login.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../app/core/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone:true,
  imports:[FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  returnUrl: string = '/dashboard';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toaStr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }
changDef =inject(ChangeDetectorRef)
  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  // Load saved credentials if Remember Me was checked
    this.loadSavedCredentials();

    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const loginData = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
        //  this.toaStr.success('Welcome back!', 'Login Successful');
          this.router.navigate([this.returnUrl]);
        } else {
          this.toaStr.error(response.message || 'Login failed', 'Error');
          this.isLoading =false
        this.changDef.detectChanges()
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.toaStr.error(error.message || 'Invalid email or password', 'Login Failed');
        this.changDef.detectChanges()
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
   goToforgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }



  // Load saved credentials from localStorage
  private loadSavedCredentials(): void {
    const savedEmail = localStorage.getItem('remembered_email');
    const savedPassword = localStorage.getItem('remembered_password');
    const rememberMe = localStorage.getItem('remember_me') === 'true';

    if (rememberMe && savedEmail && savedPassword) {
      this.loginForm.patchValue({
        email: savedEmail,
        password: savedPassword,
        rememberMe: true
      });
    }
  }

  // Save credentials if Remember Me is checked
  private saveCredentials(email: string, password: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem('remembered_email', email);
      localStorage.setItem('remembered_password', password);
      localStorage.setItem('remember_me', 'true');
    } else {
      localStorage.removeItem('remembered_email');
      localStorage.removeItem('remembered_password');
      localStorage.removeItem('remember_me');
    }
  }
}
