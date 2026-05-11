// src/app/modules/bookings/pages/check-in-out/check-in-out.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BookingService } from '../../../../core/services/booking.service';
import { Booking } from '../../../../core/models/booking.model';

interface CheckInData {
  bookingId: number;
  guestName: string;
  roomNumber: string;
  checkInDate: Date;
  checkOutDate: Date;
  idCardNumber?: string;
  vehicleNumber?: string;
  specialNotes?: string;
}

interface CheckOutData {
  bookingId: number;
  guestName: string;
  roomNumber: string;
  extraCharges?: number;
  notes?: string;
}

@Component({
  selector: 'app-check-in-out',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './check-in-out.component.html',
  styleUrls: ['./check-in-out.component.scss']
})
export class CheckInOutComponent implements OnInit, OnDestroy {
  activeTab: 'checkin' | 'checkout' = 'checkin';

  // Check-in Data
  checkInBookings: Booking[] = [];
  selectedCheckInBooking: Booking | null = null;
  checkInForm: FormGroup;
  isCheckingIn = false;
  isSearchingCheckIn = false;
  checkInSearchTerm = '';

  // Check-out Data
  checkOutBookings: Booking[] = [];
  selectedCheckOutBooking: Booking | null = null;
  checkOutForm: FormGroup;
  isCheckingOut = false;
  isSearchingCheckOut = false;
  checkOutSearchTerm = '';

  private refreshInterval: any;
 private bookingService: BookingService= inject(BookingService);

  constructor(
    private fb: FormBuilder,

    private router: Router,
    private toastr: ToastrService
  ) {
    this.checkInForm = this.fb.group({
      idCardNumber: ['', [Validators.required, Validators.minLength(5)]],
      vehicleNumber: [''],
      specialNotes: ['']
    });

    this.checkOutForm = this.fb.group({
      extraCharges: [0, [Validators.min(0)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadCheckInBookings();
    this.loadCheckOutBookings();

    // Auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadCheckInBookings();
      this.loadCheckOutBookings();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // ==================== CHECK-IN METHODS ====================

  loadCheckInBookings(): void {
    this.isSearchingCheckIn = true;
    this.bookingService.getTodaysArrivals().subscribe({
      next: (response:any) => {
        if (response.success) {
          this.checkInBookings = response.data;
        }
        this.isSearchingCheckIn = false;
      },
      error: (error:any) => {
        console.error('Error loading check-in bookings:', error);
        this.isSearchingCheckIn = false;
      }
    });
  }

  searchCheckInBookings(): void {
    if (!this.checkInSearchTerm.trim()) {
      this.loadCheckInBookings();
      return;
    }

    this.isSearchingCheckIn = true;
    const searchTerm = this.checkInSearchTerm.toLowerCase();

    // Filter locally for demo - in production, call API with search param
    setTimeout(() => {
      this.bookingService.getTodaysArrivals().subscribe({
        next: (response:any) => {
          if (response.success) {
            this.checkInBookings = response.data.filter((booking:any) =>
              booking.guestName.toLowerCase().includes(searchTerm) ||
              booking.bookingReference.toLowerCase().includes(searchTerm) ||
              booking.roomNumber.toLowerCase().includes(searchTerm)
            );
          }
          this.isSearchingCheckIn = false;
        },
        error: (error:any) => {
          console.error('Error searching check-in bookings:', error);
          this.isSearchingCheckIn = false;
        }
      });
    }, 300);
  }

  selectCheckInBooking(booking: Booking): void {
    this.selectedCheckInBooking = booking;
    this.checkInForm.reset({
      idCardNumber: '',
      vehicleNumber: '',
      specialNotes: ''
    });
  }

  clearSelectedCheckIn(): void {
    this.selectedCheckInBooking = null;
  }

  confirmCheckIn(): void {
    if (!this.selectedCheckInBooking) return;

    if (this.checkInForm.get('idCardNumber')?.invalid) {
      this.toastr.warning('Please enter ID card number', 'Missing Information');
      return;
    }

    const checkInData: CheckInData = {
      bookingId: this.selectedCheckInBooking.bookingId,
      guestName: this.selectedCheckInBooking.guestName,
      roomNumber: this.selectedCheckInBooking.roomNumber,
      checkInDate: new Date(),
      checkOutDate: this.selectedCheckInBooking.checkOutDate,
      idCardNumber: this.checkInForm.get('idCardNumber')?.value,
      vehicleNumber: this.checkInForm.get('vehicleNumber')?.value,
      specialNotes: this.checkInForm.get('specialNotes')?.value
    };

    this.isCheckingIn = true;
    this.bookingService.checkIn(this.selectedCheckInBooking.bookingId).subscribe({
      next: (response:any) => {
        this.isCheckingIn = false;
        if (response.success) {
          this.toastr.success(`Guest ${this.selectedCheckInBooking?.guestName} checked in successfully`, 'Check-in Successful');
          this.loadCheckInBookings();
          this.loadCheckOutBookings();
          this.clearSelectedCheckIn();
        } else {
          this.toastr.error(response.message || 'Check-in failed', 'Error');
        }
      },
      error: (error:any) => {
        this.isCheckingIn = false;
        this.toastr.error(error.message || 'Failed to check in guest', 'Error');
      }
    });
  }

  // ==================== CHECK-OUT METHODS ====================

  loadCheckOutBookings(): void {
    this.isSearchingCheckOut = true;
    this.bookingService.getTodaysDepartures().subscribe({
      next: (response:any) => {
        if (response.success) {
          this.checkOutBookings = response.data;
        }
        this.isSearchingCheckOut = false;
      },
      error: (error:any) => {
        console.error('Error loading check-out bookings:', error);
        this.isSearchingCheckOut = false;
      }
    });
  }

  searchCheckOutBookings(): void {
    if (!this.checkOutSearchTerm.trim()) {
      this.loadCheckOutBookings();
      return;
    }

    this.isSearchingCheckOut = true;
    const searchTerm = this.checkOutSearchTerm.toLowerCase();

    setTimeout(() => {
      this.bookingService.getTodaysDepartures().subscribe({
        next: (response:any) => {
          if (response.success) {
            this.checkOutBookings = response.data.filter((booking:any) =>
              booking.guestName.toLowerCase().includes(searchTerm) ||
              booking.bookingReference.toLowerCase().includes(searchTerm) ||
              booking.roomNumber.toLowerCase().includes(searchTerm)
            );
          }
          this.isSearchingCheckOut = false;
        },
        error: (error:any) => {
          console.error('Error searching check-out bookings:', error);
          this.isSearchingCheckOut = false;
        }
      });
    }, 300);
  }

  selectCheckOutBooking(booking: Booking): void {
    this.selectedCheckOutBooking = booking;
    this.checkOutForm.reset({
      extraCharges: 0,
      notes: ''
    });
  }

  clearSelectedCheckOut(): void {
    this.selectedCheckOutBooking = null;
  }

  calculateTotalAmount(): number {
    if (!this.selectedCheckOutBooking) return 0;

    const extraCharges = this.checkOutForm.get('extraCharges')?.value || 0;
    return this.selectedCheckOutBooking.totalAmount + extraCharges;
  }

  confirmCheckOut(): void {
    if (!this.selectedCheckOutBooking) return;

    const extraCharges = this.checkOutForm.get('extraCharges')?.value || 0;

    const checkOutData: CheckOutData = {
      bookingId: this.selectedCheckOutBooking.bookingId,
      guestName: this.selectedCheckOutBooking.guestName,
      roomNumber: this.selectedCheckOutBooking.roomNumber,
      extraCharges: extraCharges,
      notes: this.checkOutForm.get('notes')?.value
    };

    this.isCheckingOut = true;
    this.bookingService.checkOut(this.selectedCheckOutBooking.bookingId).subscribe({
      next: (response:any) => {
        this.isCheckingOut = false;
        if (response.success) {
          let message = `Guest ${this.selectedCheckOutBooking?.guestName} checked out successfully`;
          if (extraCharges > 0) {
            message += ` with additional charges of ₦${extraCharges.toLocaleString()}`;
          }
          this.toastr.success(message, 'Check-out Successful');
          this.loadCheckInBookings();
          this.loadCheckOutBookings();
          this.clearSelectedCheckOut();
        } else {
          this.toastr.error(response.message || 'Check-out failed', 'Error');
        }
      },
      error: (error:any) => {
        this.isCheckingOut = false;
        this.toastr.error(error.message || 'Failed to check out guest', 'Error');
      }
    });
  }

  // ==================== UTILITY METHODS ====================

  switchTab(tab: 'checkin' | 'checkout'): void {
    this.activeTab = tab;
    if (tab === 'checkin') {
      this.loadCheckInBookings();
      this.clearSelectedCheckIn();
    } else {
      this.loadCheckOutBookings();
      this.clearSelectedCheckOut();
    }
  }

  formatPrice(price: number): string {
    return `₦${price.toLocaleString()}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  viewBookingDetail(bookingId: number): void {
    this.router.navigate(['/bookings/detail', bookingId]);
  }
}
