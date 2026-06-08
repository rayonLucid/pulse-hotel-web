import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GuestService, ServiceRequest } from '../../../core/services/guest.service';

@Component({
  selector: 'app-service-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './service-requests.component.html',
  styleUrls: ['./service-requests.component.scss']
})
export class ServiceRequestsComponent implements OnInit {
  private guestService = inject(GuestService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  requests: ServiceRequest[] = [];
  bookings: any[] = [];
  loading = true;
  showRequestForm = false;
  submitting = false;

  requestForm!: FormGroup;

  requestTypes = [
    { value: 'Housekeeping', label: 'Housekeeping (cleaning, towels, etc.)' },
    { value: 'Maintenance', label: 'Maintenance (AC, plumbing, etc.)' },
    { value: 'RoomService', label: 'Room Service (food & beverages)' },
    { value: 'Laundry', label: 'Laundry' },
    { value: 'Other', label: 'Other' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.requestForm = this.fb.group({
      bookingId: [null, Validators.required],
      requestType: ['Housekeeping', Validators.required],
      requestDetails: ['', Validators.maxLength(500)]
    });
  }

  loadData() {
    this.loading = true;
    // Load service requests and bookings (upcoming bookings)
    this.guestService.getServiceRequests().subscribe({
      next: (res) => {
        this.requests = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load service requests');
        this.loading = false;
      }
    });

    // Load upcoming bookings to populate dropdown
    this.guestService.getDashboard().subscribe({
      next: (res) => {
        this.bookings = res.data.upcomingBookings || [];
      },
      error: (err) => console.error(err)
    });
  }

  openRequestForm() {
    this.showRequestForm = true;
  }

  closeRequestForm() {
    this.showRequestForm = false;
    this.requestForm.reset({ requestType: 'Housekeeping' });
  }

  submitRequest() {
    if (this.requestForm.invalid) {
      this.toastr.warning('Please select a booking and request type');
      return;
    }

    this.submitting = true;
    const payload = {
      bookingId: this.requestForm.value.bookingId,
      requestType: this.requestForm.value.requestType,
      requestDetails: this.requestForm.value.requestDetails
    };

    this.guestService.createServiceRequest(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Service request submitted successfully');
          this.closeRequestForm();
          this.loadData(); // refresh list
        } else {
          this.toastr.error(res.message || 'Submission failed');
        }
        this.submitting = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to submit request');
        this.submitting = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'inprogress': return 'status-progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }
}
