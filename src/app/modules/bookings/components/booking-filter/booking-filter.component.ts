// src/app/modules/bookings/components/booking-filter/booking-filter.component.ts
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

export interface FilterCriteria {
  status: string;
  guestName: string;
  roomNumber: string;
  startDate: string;
  endDate: string;
  paymentStatus: string;
}


@Component({
  selector: 'app-booking-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './booking-filter.component.html',
  styleUrls: ['./booking-filter.component.scss']
})
export class BookingFilterComponent implements OnInit {
  @Output() filterChange = new EventEmitter<FilterCriteria>();
  @Output() clearFilters = new EventEmitter<void>();

  filterForm: FormGroup;
  isExpanded = false;
  private subscription?: Subscription;

  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'CheckedIn', label: 'Checked In' },
    { value: 'CheckedOut', label: 'Checked Out' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'NoShow', label: 'No Show' }
  ];

  paymentStatusOptions = [
    { value: '', label: 'All Payments' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Paid', label: 'Paid' },
    { value: 'PartiallyPaid', label: 'Partially Paid' },
    { value: 'Refunded', label: 'Refunded' },
    { value: 'Failed', label: 'Failed' }
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      status: [''],
      guestName: [''],
      roomNumber: [''],
      startDate: [''],
      endDate: [''],
      paymentStatus: ['']
    });
  }

  ngOnInit(): void {
    this.subscription = this.filterForm.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(values => {
        this.filterChange.emit(values);
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  onClearFilters(): void {
    this.filterForm.reset({
      status: '',
      guestName: '',
      roomNumber: '',
      startDate: '',
      endDate: '',
      paymentStatus: ''
    });
    this.clearFilters.emit();
  }

  getActiveFilterCount(): number {
    let count = 0;
    const values = this.filterForm.value;
    if (values.status) count++;
    if (values.guestName) count++;
    if (values.roomNumber) count++;
    if (values.startDate) count++;
    if (values.endDate) count++;
    if (values.paymentStatus) count++;
    return count;
  }
}
