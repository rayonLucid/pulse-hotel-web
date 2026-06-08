import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GuestService, GuestUser } from '../../../core/services/guest.service';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private guestService = inject(GuestService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  profileForm!: FormGroup;
  loading = true;
  updating = false;
  guestUser: GuestUser | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  initForm() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{8,15}$/)]],
      email: [{ value: '', disabled: true }],
      loyaltyPoints: [{ value: 0, disabled: true }]
    });
  }

  loadProfile() {
    this.loading = true;
    this.guestUser = this.guestService.getGuestUser();
    this.guestService.getProfile().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.profileForm.patchValue({
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            phoneNumber: res.data.phoneNumber,
            email: res.data.email,
            loyaltyPoints: res.data.loyaltyPoints
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load profile');
        this.loading = false;
      }
    });
  }

  updateProfile() {
    if (this.profileForm.invalid) {
      this.toastr.warning('Please correct the form errors');
      return;
    }

    this.updating = true;
    const payload = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      phoneNumber: this.profileForm.value.phoneNumber
    };

    this.guestService.updateProfile(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Profile updated successfully');
          // Refresh guest user in service (optional)
          this.loadProfile(); // reload to get fresh data
        } else {
          this.toastr.error(res.message || 'Update failed');
        }
        this.updating = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to update profile');
        this.updating = false;
      }
    });
  }

  goToChangePassword() {
    this.router.navigate(['/guest/change-password']);
  }
}
