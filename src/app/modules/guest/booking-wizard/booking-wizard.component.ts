// booking-wizard.component.ts (partial – show only changes)
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { BookingDraft, BookingStateService } from '../../../core/services/booking-state.service';
import { GuestService } from '../../../core/services/guest.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoginModalComponent } from '../guest-login-modal/guest-login-modal.component';
import { RegisterModalComponent } from '../register-modal/register-modal.component';

@Component({
  selector: 'app-booking-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,NgxPaginationModule,LoginModalComponent,RegisterModalComponent],
  templateUrl: './booking-wizard.component.html',
  styleUrls: ['./booking-wizard.component.scss']
})
export class BookingWizardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private guestService = inject(GuestService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private bookingState = inject(BookingStateService);
currentPage = 1;
  itemsPerPage = 8;
  bookingForm!: FormGroup;
  availableRooms: any[] = [];
  loadingRooms = false;
  submitting = false;
  step = 1;
  isLoggedIn = false;
  today =new Date()
   tomorrow = new Date(this.today);
cdr =inject(ChangeDetectorRef)

searched =false

  showLoginModal = false;
  pendingRoomId: number | null = null;


showRegisterModal = false;


  ngOnInit(): void {
    this.tomorrow.setDate(this.today.getDate() + 1);
    this.isLoggedIn = !!this.guestService.getGuestUser();

    // Restore draft if coming back from login/register
    const draft = this.bookingState.getDraft();
    if (draft) {
      this.bookingForm.patchValue({
        checkInDate: draft.checkInDate,
        checkOutDate: draft.checkOutDate,
        numberOfAdults: draft.numberOfAdults,
        numberOfChildren: draft.numberOfChildren,
        specialRequests: draft.specialRequests || '',
        selectedRoomId: draft.selectedRoomId || null
      });
      if (draft.selectedRoomId) {
        this.step = 2; // skip to confirmation if room already selected
        this.searchRooms(); // preload rooms so we have details
      }
    } else {
      this.initForm();
    }
  }

  initForm() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    this.bookingForm = this.fb.group({
      checkInDate: [today, Validators.required],
      checkOutDate: [tomorrow, Validators.required],
      numberOfAdults: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      numberOfChildren: [0, [Validators.min(0), Validators.max(10)]],
      specialRequests: [''],
      selectedRoomId: [null, Validators.required]
    });
  }




  // ... existing searchRooms(), selectRoom(), etc.

   searchRooms() {
    const { checkInDate, checkOutDate } = this.bookingForm.value;
    if (!checkInDate || !checkOutDate) {
      this.toastr.warning('Please select check-in and check-out dates');
      return;
    }
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      this.toastr.error('Check-out date must be after check-in date');
      return;
    }

    this.loadingRooms = true;
    this.searched = true;
    this.guestService.getAvailableRooms(checkInDate, checkOutDate).subscribe({
      next: (res) => {
      //  console.log(res)
        this.availableRooms = (res.data || []).filter((r: any) => r.isAvailable);
        if (this.availableRooms.length === 0) {
          this.toastr.info('No rooms available for selected dates. Try different dates.');
        }
        this.loadingRooms = false;
        this.cdr.detectChanges()
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load available rooms');
        this.loadingRooms = false;
      }
    });
  }

  selectRoom(roomId: number) {
   let guestInfo = this.guestService.getGuestUser()
   console.log(guestInfo)
    // Before moving to step 2, check authentication
    if (!this.isLoggedIn) {
       this.pendingRoomId = roomId;
      this.showLoginModal = true;

      // Save current form data to state service
      const formValue = this.bookingForm.value;
      const draft: BookingDraft = {
        checkInDate: formValue.checkInDate,
        checkOutDate: formValue.checkOutDate,
        numberOfAdults: formValue.numberOfAdults,
        numberOfChildren: formValue.numberOfChildren,
        specialRequests: formValue.specialRequests,
        selectedRoomId: roomId
      };
      this.bookingState.saveDraft(draft);
    //  this.toastr.info('Please login or register to continue booking');
     // this.router.navigate(['/guest/login']);
      return;
    }

    // If logged in, proceed normally
    this.bookingForm.patchValue({ selectedRoomId: roomId });
    this.step = 2;
  }
onLoginSuccess() {
    this.isLoggedIn = true;
    if (this.pendingRoomId) {
      this.selectRoom(this.pendingRoomId);
      this.pendingRoomId = null;
    }
  }

  closeLoginModal() {
    this.showLoginModal = false;
    this.pendingRoomId = null;
  }

  closeRegisterModal() {
  this.showRegisterModal = false;
  this.pendingRoomId = null;
}

onRegistrationSuccess() {
  this.isLoggedIn = true;
  if (this.pendingRoomId) {
    this.selectRoom(this.pendingRoomId);
    this.pendingRoomId = null;
  }
}

openRegisterModal() {
  this.showLoginModal = false;
  this.showRegisterModal = true;
}
  confirmBooking() {
    if (!this.isLoggedIn) {
      // Should not happen because step 2 is only reachable when logged in, but double-check
      this.selectRoom(this.bookingForm.value.selectedRoomId);
      return;
    }
    // ... existing confirm logic
    // After successful booking, clear draft
    this.bookingState.clearDraft();
  }

   getSelectedRoom() {
    const roomId = this.bookingForm.get('selectedRoomId')?.value;
    return this.availableRooms.find(r => r.roomId === roomId);
  }

  goBack() {
    this.step = 1;
    this.bookingForm.patchValue({ selectedRoomId: null });
  }

}
