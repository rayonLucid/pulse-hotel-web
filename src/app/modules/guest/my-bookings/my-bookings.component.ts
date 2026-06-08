import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GuestService } from '../../../core/services/guest.service';

interface Booking {
  bookingId: number;
  bookingReference: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  paymentStatus: string;
  bookingStatus: string;
}

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {
  private guestService = inject(GuestService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  upcomingBookings: Booking[] = [];
  pastBookings: Booking[] = [];
  loading = true;
  showCancelModal = false;
  selectedBooking: Booking | null = null;
  cancelReason = '';
  isCancelling = false;

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings() {
    this.loading = true;
    this.guestService.getDashboard().subscribe({
      next: (res) => {
        this.upcomingBookings = res.data.upcomingBookings || [];
        this.pastBookings = res.data.pastBookings || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load bookings');
        this.loading = false;
      }
    });
  }

  isCancellable(booking: Booking): boolean {
    // Can cancel only if status is Confirmed or Pending and check-in is at least 1 day away
    const today = new Date();
    const checkIn = new Date(booking.checkInDate);
    const diffDays = Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return ['Confirmed', 'Pending'].includes(booking.bookingStatus) && diffDays >= 1;
  }

  openCancelModal(booking: Booking) {
    this.selectedBooking = booking;
    this.cancelReason = '';
    this.showCancelModal = true;
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.selectedBooking = null;
    this.cancelReason = '';
  }

  confirmCancel() {
    if (!this.selectedBooking) return;
    this.isCancelling = true;
    this.guestService.cancelBooking(this.selectedBooking.bookingId, this.cancelReason).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Booking cancelled successfully');
          this.loadBookings();
          this.closeCancelModal();
        } else {
          this.toastr.error(res.message || 'Cancellation failed');
        }
        this.isCancelling = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to cancel booking');
        this.isCancelling = false;
      }
    });
  }

  viewBookingDetails(booking: Booking) {
    // Optional: navigate to booking details page (not implemented yet)
    this.toastr.info('Booking details view coming soon');
  }
}
