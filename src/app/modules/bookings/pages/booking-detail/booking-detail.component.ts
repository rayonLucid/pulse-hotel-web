// src/app/modules/bookings/pages/booking-detail/booking-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BookingService } from '../../../../core/services/booking.service';
import { Booking } from '../../../../core/models/booking.model';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.scss']
})
export class BookingDetailComponent implements OnInit {
  booking: Booking | null = null;
  isLoading = true;
  isProcessing = false;
  showCancelModal = false;
  cancelReason = '';

  // Timeline events
  timelineEvents: TimelineEvent[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBooking(parseInt(id));
    } else {
      this.router.navigate(['/bookings']);
    }
  }

  loadBooking(id: number): void {
    this.isLoading = true;
    this.bookingService.getBookingById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.booking = response.data;
          this.generateTimeline();
          this.isLoading = false;
        } else {
          this.toastr.error('Booking not found', 'Error');
          this.router.navigate(['/bookings']);
        }
      },
      error: (error) => {
        console.error('Error loading booking:', error);
        this.toastr.error('Failed to load booking details', 'Error');
        this.isLoading = false;
        this.router.navigate(['/bookings']);
      }
    });
  }

  generateTimeline(): void {
    if (!this.booking) return;

    this.timelineEvents = [
      {
        date: new Date(this.booking.bookingDate),
        title: 'Booking Created',
        description: `Booking #${this.booking.bookingReference} was created`,
        icon: 'fas fa-calendar-plus',
        status: 'completed'
      },
      {
        date: new Date(this.booking.bookingDate),
        title: 'Payment',
        description: `Payment status: ${this.booking.paymentStatus}`,
        icon: this.booking.paymentStatus === 'Paid' ? 'fas fa-check-circle' : 'fas fa-clock',
        status: this.booking.paymentStatus === 'Paid' ? 'completed' : 'pending'
      }
    ];

    if (this.booking.bookingStatus === 'Confirmed') {
      this.timelineEvents.push({
        date: new Date(this.booking.bookingDate),
        title: 'Booking Confirmed',
        description: 'Your booking has been confirmed',
        icon: 'fas fa-check-circle',
        status: 'completed'
      });
    }

    if (this.booking.bookingStatus === 'CheckedIn') {
      this.timelineEvents.push({
        date: new Date(this.booking.checkInTime || this.booking.checkInDate),
        title: 'Checked In',
        description: 'Guest has checked in',
        icon: 'fas fa-sign-in-alt',
        status: 'completed'
      });
    }

    if (this.booking.bookingStatus === 'CheckedOut') {
      this.timelineEvents.push({
        date: new Date(this.booking.checkOutTime || this.booking.checkOutDate),
        title: 'Checked Out',
        description: 'Guest has checked out',
        icon: 'fas fa-sign-out-alt',
        status: 'completed'
      });
    }

    if (this.booking.bookingStatus === 'Cancelled') {
      this.timelineEvents.push({
        date: new Date(),
        title: 'Cancelled',
        description: 'Booking has been cancelled',
        icon: 'fas fa-times-circle',
        status: 'cancelled'
      });
    }

    // Sort by date
    this.timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  getStatusClass(): string {
    const classes: { [key: string]: string } = {
      'Pending': 'status-pending',
      'Confirmed': 'status-confirmed',
      'CheckedIn': 'status-checked-in',
      'CheckedOut': 'status-checked-out',
      'Cancelled': 'status-cancelled',
      'NoShow': 'status-no-show'
    };
    return classes[this.booking?.bookingStatus || 'Pending'] || 'status-pending';
  }

  getPaymentStatusClass(): string {
    const classes: { [key: string]: string } = {
      'Pending': 'payment-pending',
      'Paid': 'payment-paid',
      'PartiallyPaid': 'payment-partial',
      'Refunded': 'payment-refunded',
      'Failed': 'payment-failed'
    };
    return classes[this.booking?.paymentStatus || 'Pending'] || 'payment-pending';
  }

  getPaymentIcon(): string {
    const icons: { [key: string]: string } = {
      'Pending': 'fas fa-clock',
      'Paid': 'fas fa-check-circle',
      'PartiallyPaid': 'fas fa-adjust',
      'Refunded': 'fas fa-undo-alt',
      'Failed': 'fas fa-times-circle'
    };
    return icons[this.booking?.paymentStatus || 'Pending'] || 'fas fa-credit-card';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return `₦${price.toLocaleString()}`;
  }

  canCheckIn(): boolean {
    return this.booking?.bookingStatus === 'Confirmed';
  }

  canCheckOut(): boolean {
    return this.booking?.bookingStatus === 'CheckedIn';
  }

  canCancel(): boolean {
    return this.booking?.bookingStatus === 'Pending' ||
           this.booking?.bookingStatus === 'Confirmed';
  }

  checkIn(): void {
    if (!this.booking) return;

    if (confirm(`Check in guest ${this.booking.guestName}?`)) {
      this.isProcessing = true;
      this.bookingService.checkIn(this.booking.bookingId).subscribe({
        next: (response) => {
          this.isProcessing = false;
          if (response.success) {
            this.toastr.success(`Guest ${this.booking?.guestName} checked in successfully`, 'Check-in Successful');
            this.loadBooking(this.booking!.bookingId);
          } else {
            this.toastr.error(response.message || 'Check-in failed', 'Error');
          }
        },
        error: (error) => {
          this.isProcessing = false;
          this.toastr.error(error.message || 'Failed to check in guest', 'Error');
        }
      });
    }
  }

  checkOut(): void {
    if (!this.booking) return;

    if (confirm(`Check out guest ${this.booking.guestName}?`)) {
      this.isProcessing = true;
      this.bookingService.checkOut(this.booking.bookingId).subscribe({
        next: (response) => {
          this.isProcessing = false;
          if (response.success) {
            this.toastr.success(`Guest ${this.booking?.guestName} checked out successfully`, 'Check-out Successful');
            this.loadBooking(this.booking!.bookingId);
          } else {
            this.toastr.error(response.message || 'Check-out failed', 'Error');
          }
        },
        error: (error) => {
          this.isProcessing = false;
          this.toastr.error(error.message || 'Failed to check out guest', 'Error');
        }
      });
    }
  }

  openCancelModal(): void {
    this.cancelReason = '';
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.cancelReason = '';
  }

  confirmCancel(): void {
    if (!this.booking) return;

    if (!this.cancelReason.trim()) {
      this.toastr.warning('Please provide a reason for cancellation', 'Reason Required');
      return;
    }

    this.isProcessing = true;
    this.bookingService.cancelBooking(this.booking.bookingId, this.cancelReason).subscribe({
      next: (response) => {
        this.isProcessing = false;
        if (response.success) {
          this.toastr.success('Booking cancelled successfully', 'Cancelled');
          this.closeCancelModal();
          this.loadBooking(this.booking!.bookingId);
        } else {
          this.toastr.error(response.message || 'Cancellation failed', 'Error');
        }
      },
      error: (error) => {
        this.isProcessing = false;
        this.toastr.error(error.message || 'Failed to cancel booking', 'Error');
      }
    });
  }

  printBooking(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/bookings']);
  }
}

interface TimelineEvent {
  date: Date;
  title: string;
  description: string;
  icon: string;
  status: 'completed' | 'pending' | 'cancelled';
}
