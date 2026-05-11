// src/app/modules/bookings/pages/bookings-list/bookings-list.component.ts
import { Component, OnInit, OnDestroy, inject, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { BookingService } from '../../../../../core/services/booking.service';
import { Booking, BookingStats } from '../../../../../core/models/booking.model';
import { BookingCardComponent } from '../../../components/booking-card/booking-card/booking-card.component';
import { BookingFilterComponent, FilterCriteria } from '../../../components/booking-filter/booking-filter.component';



@Component({
  selector: 'app-bookings-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    BookingCardComponent,
    BookingFilterComponent
  ],
  templateUrl: './bookings-list.component.html',
  styleUrls: ['./bookings-list.component.scss']
})
export class BookingsListComponent implements OnInit, OnDestroy {
  // In booking-filter.component.ts, ensure the emit type is correct
@Output() filterChange = new EventEmitter<FilterCriteria>();
  bookings: Booking[] = [];
  stats: BookingStats | null = null;
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  selectedStatus: string = '';

  private subscriptions: Subscription = new Subscription();
  private bookingService: BookingService = inject(BookingService);
  constructor(

    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Computed property for page numbers
  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
  
  /**
   * Load bookings with current filters
   */
  loadBookings(): void {
    this.isLoading = true;

    const filters = {
      status: this.selectedStatus || undefined,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.subscriptions.add(
      this.bookingService.getBookings(filters).subscribe({
        next: (response) => {
          this.bookings = response.data;
          this.totalItems = response.pagination.totalItems;
          this.totalPages = response.pagination.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading bookings:', error);
          this.toastr.error('Failed to load bookings', 'Error');
          this.isLoading = false;
        }
      })
    );
  }

  /**
   * Load booking statistics
   */
  loadStats(): void {
    this.subscriptions.add(
      this.bookingService.getBookingStats().subscribe({
        next: (response) => {
          if (response.success) {
            this.stats = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading stats:', error);
        }
      })
    );
  }

  /**
   * Handle filter changes from the filter component
   */
  onFilterChange(filters: FilterCriteria): void {
    this.selectedStatus = filters.status;
    this.currentPage = 1;
    this.loadBookings();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.selectedStatus = '';
    this.currentPage = 1;
    this.loadBookings();
  }

  /**
   * Handle status button click
   */
  onStatusSelect(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadBookings();
  }

  /**
   * Handle page change
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadBookings();
  }

  /**
   * Refresh bookings (called after check-in/out or cancellation)
   */
  refreshBookings(): void {
    this.loadStats();
    this.loadBookings();
  }

  /**
   * Get status badge CSS class
   */
  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Pending': 'badge-warning',
      'Confirmed': 'badge-success',
      'CheckedIn': 'badge-info',
      'CheckedOut': 'badge-secondary',
      'Cancelled': 'badge-danger',
      'NoShow': 'badge-dark'
    };
    return classes[status] || 'badge-light';
  }

  /**
   * Get payment status badge CSS class
   */
  getPaymentStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Pending': 'badge-warning',
      'Paid': 'badge-success',
      'PartiallyPaid': 'badge-info',
      'Refunded': 'badge-secondary',
      'Failed': 'badge-danger'
    };
    return classes[status] || 'badge-light';
  }
}
