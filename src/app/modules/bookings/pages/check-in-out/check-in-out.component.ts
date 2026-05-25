// src/app/modules/bookings/pages/check-in-out/check-in-out.component.ts
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BookingService } from '../../../../core/services/booking.service';
import { Booking } from '../../../../core/models/booking.model';
import  PaystackPop from '@paystack/inline-js';

interface CheckInData {
  bookingId: number;
  // guestName: string;
  roomNumber: string;
  checkInDate: Date;
  checkOutDate: Date;
  idCardNumber?: string;
  vehicleNumber?: string;
  specialNotes?: string;
  guestId: number;
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
   IsNewCheckIn =false
  // Check-in Data
  checkInBookings: Booking[] = [];
  selectedCheckInBooking: Booking | null = null;
  checkInForm: FormGroup;
  isCheckingIn = false;
  isSearchingCheckIn = false;
  checkInSearchTerm = '';
isLoading =false
  // Check-out Data
  checkOutBookings: Booking[] = [];
  selectedCheckOutBooking: Booking | null = null;
  checkOutForm: FormGroup;
  isCheckingOut = false;
  isSearchingCheckOut = false;
  checkOutSearchTerm = '';

  private refreshInterval: any;
 private bookingService: BookingService= inject(BookingService);
  private changeDet = inject(ChangeDetectorRef);
  cdr = inject(ChangeDetectorRef);
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
      //  console.log('Check-in Bookings:', response.data);
        if (response.success) {
          this.checkInBookings = response.data.filter((booking:any) => booking.bookingStatus === 'Confirmed' || booking.bookingStatus === 'Pending');
        }
        this.isSearchingCheckIn = false;
        this.changeDet.detectChanges();
      },
      error: (error:any) => {
       // console.error('Error loading check-in bookings:', error.error);
        this.toastr.error(error.error.message, 'Error');
        this.isSearchingCheckIn = false;
        this.changeDet.detectChanges();
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
    if (!confirm('Are you sure you want to check in this guest?')) {
      return;
    }

    if (!this.selectedCheckInBooking) return;

    if (this.checkInForm.get('idCardNumber')?.invalid) {
      this.toastr.warning('Please enter ID card number', 'Missing Information');
      return;
    }

    const checkInData: CheckInData = {
      bookingId: this.selectedCheckInBooking.bookingId,
      // guestName: this.selectedCheckInBooking.guestName,
       roomNumber: this.selectedCheckInBooking.roomNumber,
      checkInDate: new Date(),
      checkOutDate: this.selectedCheckInBooking.checkOutDate,
      idCardNumber: this.checkInForm.get('idCardNumber')?.value,
      vehicleNumber: this.checkInForm.get('vehicleNumber')?.value,
      specialNotes: this.checkInForm.get('specialNotes')?.value,
      guestId: this.selectedCheckInBooking.userId
    };

    this.isCheckingIn = true;
    this.bookingService.checkIn(this.selectedCheckInBooking.bookingId, checkInData).subscribe({
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
        this.toastr.error(error.error.message || 'Failed to check in guest', 'Error');
        console.error('Error during check-in:', error);
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
        console.error('Error loading check-out:', error);
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
  MakePayment(bookingId: number): void {
    // Trigger payStack Gateway
    let extraCharges = this.checkOutForm.get('extraCharges')?.value || 0;
    if (extraCharges <= 0) {
      this.toastr.warning('No extra charges to pay', 'Payment Not Required');
      return;
    }
    this.isLoading = true;
    this.bookingService.makePayment(bookingId,extraCharges).subscribe({
      next: (response:any) => {
         console.log('Payment initiation response:', response);
        if (response.success) {

         this. payWithPaystack(response.data,extraCharges)
        } else {
          this.toastr.error('Failed to initiate payment', 'Error');
        }
      },
      error: (error:any) => {
        this.toastr.error(error.message || 'Failed to initiate payment', 'Error');
         this.isLoading = false;
        console.error('Error initiating payment:', error);
       this.cdr.detectChanges();
      }
    });


  }


  payWithPaystack(bookingData: any,extraCharges: number): void {
  console.log('Initiating Paystack payment with data:', bookingData);
    const payStack = new PaystackPop();

    payStack.newTransaction({
      key:bookingData.payStackKey , // Replace with your Public Key
      email: bookingData.guestEmail,
      amount: Math.round(extraCharges * 100), // PayStack operates strictly in minor unit variants (kobo for NGN)
      currency: 'NGN',
      reference: bookingData.bookingReference || 'BK-' + bookingData.bookingId + '-' + Date.now(),
      metadata: {
        custom_fields: [
          {
            display_name: "Guest Name",
            variable_name: "guest_name",
            value: `${bookingData.guestName}`
          },
          {
            display_name: "Booking ID",
            variable_name: "booking_id",
            value: bookingData.bookingId
          }
        ]
      },
      onSuccess: (transaction: any) => {
        this.isLoading = false;
        this.toastr.success('Payment successful!', 'Success');
        // Redirect to detail page for verification routing state updates
        this.confirmAndMarkAsPaid(bookingData.bookingId, transaction.reference);

      },
      onCancel: () => {
        this.isLoading = false;
        this.toastr.info('Payment window closed. You can fulfill this payment via your dashboard later.', 'Payment Cancelled');
        this.router.navigate(['/bookings/check-in-out']);
        this.cdr.detectChanges();
      }
    });
  }

  private confirmAndMarkAsPaid(bookingId: number, transactionReference: string): void {
  // 4. Send a localized update or verification ping immediately to update paymentStatus as paid
  this.bookingService.updatePaymentStatus( bookingId,{
   record:"Additional Payment",
    paymentStatus: 'Paid',
    status: 'Success',
    reference: transactionReference
  }).subscribe({
    next: (updateResponse: any) => {
      this.isLoading = false;
      this.toastr.success('Payment successfully authorized & validated!', 'Success');

      // Send them straight to their finalized reservation receipt dashboard view
      this.router.navigate(['/bookings/check-in-out']);
    },
    error: (err: any) => {
      this.isLoading = false;
      this.toastr.warning('Payment was processed but verification failed. Our team will review your order.', 'Verification Warning');
      this.router.navigate(['/bookings/check-in-out']);
      console.error('Error updating payment status:', err);
    }
  });
}
}
