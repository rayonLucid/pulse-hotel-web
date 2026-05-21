// src/app/modules/settings/pages/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService, User } from '../../../../core/auth/auth.service';
import { SettingsSidebarComponent } from '../../components/settings-sidebar/settings-sidebar.component';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SettingsSidebarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = false;
  isSaving = false;
  user!: User | null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      department: [''],
      position: [''],
      bio: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
     this.user = this.authService.getCurrentUser();
    console.log('Loaded user data:', this.user);
    if (this.user) {
      this.profileForm.patchValue({
        fullName: this.user.fullName,
        email: this.user.email,
        phoneNumber: this.user.phoneNumber
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    this.isSaving = true;
    // Call API to update profile
    setTimeout(() => {
      this.isSaving = false;
      this.toastr.success('Profile updated successfully', 'Success');
    }, 1000);
  }
}
