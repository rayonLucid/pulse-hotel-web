// src/app/modules/settings/pages/security/security.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SettingsSidebarComponent } from '../../components/settings-sidebar/settings-sidebar.component';
import { AuthService, User } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SettingsSidebarComponent],
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit {
  passwordForm: FormGroup;
  twoFactorEnabled = false;
  isSaving = false;
 user!: User | null;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
  ngOnInit(): void {
    this.loadUserData()
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.toastr.warning('Please fill all fields correctly', 'Validation Error');
      return;
    }

    this.isSaving = true;
    setTimeout(() => {
      this.isSaving = false;
      this.toastr.success('Password changed successfully', 'Success');
      this.passwordForm.reset();
    }, 1000);
  }

  toggleTwoFactor(): void {
    this.twoFactorEnabled = !this.twoFactorEnabled;
    this.toastr.info(`${this.twoFactorEnabled ? 'Enabled' : 'Disabled'} Two-Factor Authentication`, 'Security');
  }

    loadUserData(): void {
     this.user = this.authService.getCurrentUser();
    console.log('Loaded user data:', this.user?.role);


  }

}
