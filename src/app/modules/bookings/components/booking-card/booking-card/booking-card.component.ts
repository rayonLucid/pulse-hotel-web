// src/app/modules/bookings/components/booking-card/booking-card.component.ts
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Booking } from '../../../../../core/models/booking.model';
import { BookingService } from '../../../../../core/services/booking.service';


@Component({
  selector: 'app-booking-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './booking-card.component.html',
  styleUrls: ['./booking-card.component.scss']
})
export class BookingCardComponent {
  @Input() booking!: Booking;
  @Output() refresh = new EventEmitter<void>();

  showActions = false;
  isProcessing = false;
 private bookingService: BookingService = inject(BookingService);
  constructor(

    private toastr: ToastrService
  ) {}

  getStatusClass(): string {
    const classes: { [key: string]: string } = {
      'Pending': 'status-pending',
      'Confirmed': 'status-confirmed',
      'CheckedIn': 'status-checked-in',
      'CheckedOut': 'status-checked-out',
      'Cancelled': 'status-cancelled',
      'NoShow': 'status-no-show'
    };
    return classes[this.booking.bookingStatus] || 'status-pending';
  }

  getPaymentStatusClass(): string {
    const classes: { [key: string]: string } = {
      'Pending': 'payment-pending',
      'Paid': 'payment-paid',
      'PartiallyPaid': 'payment-partial',
      'Refunded': 'payment-refunded',
      'Failed': 'payment-failed'
    };
    return classes[this.booking.paymentStatus] || 'payment-pending';
  }

  getNightsText(): string {
    return this.booking.totalNights === 1 ? 'night' : 'nights';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /**
   * Check-in guest
   */
  checkIn(): void {
    if (this.isProcessing) return;

    if (confirm(`Check in guest ${this.booking.guestName}?`)) {
      this.isProcessing = true;
      this.bookingService.checkIn(this.booking.bookingId, {
        roomNumber: this.booking.roomNumber,
        checkInDate: new Date(),
        checkOutDate: this.booking.checkOutDate,
        guestId: this.booking.userId
       }).subscribe({
        next: (response) => {
          this.isProcessing = false;
          if (response.success) {
            this.toastr.success(`Guest ${this.booking.guestName} has been checked in successfully.`, 'Check-in Successful');
            this.refresh.emit();
          } else {
            this.toastr.error(response.message || 'Check-in failed', 'Error');
          }
        },
        error: (error) => {
          this.isProcessing = false;
          this.toastr.error(error.message || 'Failed to check in guest', 'Check-in Failed');
        }
      });
    }
  }

  /**
   * Check-out guest
   */
  checkOut(): void {
    if (this.isProcessing) return;

    if (confirm(`Check out guest ${this.booking.guestName}?`)) {
      this.isProcessing = true;
      this.bookingService.checkOut(this.booking.bookingId).subscribe({
        next: (response) => {
          this.isProcessing = false;
          if (response.success) {
            this.toastr.success(`Guest ${this.booking.guestName} has been checked out successfully.`, 'Check-out Successful');
            this.refresh.emit();
          } else {
            this.toastr.error(response.message || 'Check-out failed', 'Error');
          }
        },
        error: (error) => {
          this.isProcessing = false;
          this.toastr.error(error.message || 'Failed to check out guest', 'Check-out Failed');
        }
      });
    }
  }

  /**
   * Cancel booking
   */
  cancelBooking(): void {
    if (this.isProcessing) return;

    const reason = prompt('Please provide a reason for cancellation:');
    if (reason && reason.trim()) {
      this.isProcessing = true;
      this.bookingService.cancelBooking(this.booking.bookingId, reason).subscribe({
        next: (response) => {
          this.isProcessing = false;
          if (response.success) {
            this.toastr.success(`Booking #${this.booking.bookingReference} has been cancelled.`, 'Booking Cancelled');
            this.refresh.emit();
          } else {
            this.toastr.error(response.message || 'Cancellation failed', 'Error');
          }
        },
        error: (error:any) => {
          this.isProcessing = false;
          this.toastr.error(error.message || 'Failed to cancel booking', 'Cancellation Failed');
        }
      });
    }
  }
}
