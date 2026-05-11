// src/app/modules/bookings/pages/create-booking/create-booking.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BookingService } from '../../../../core/services/booking.service';

import { CreateBookingRequest } from '../../../../core/models/booking.model';
import { RoomService } from '../../../../core/services/room.service';

interface Room {
  roomId: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  maxAdults: number;
  maxChildren: number;
  amenities: string[];
}

@Component({
  selector: 'app-create-booking',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss']
})
export class CreateBookingComponent implements OnInit {
  bookingForm: FormGroup;
  availableRooms: Room[] = [];
  selectedRoom: Room | null = null;
  isLoading = false;
  isSearching = false;
  step = 1; // 1: Search, 2: Select Room, 3: Guest Details, 4: Payment

  // Date constraints
  minDate: string;
  maxDate: string;

  // Price calculation
  totalNights = 0;
  subtotal = 0;
  taxAmount = 0;
  totalAmount = 0;
  private bookingService: BookingService = inject(BookingService);
    private roomService: RoomService = inject(RoomService);
  constructor(
    private fb: FormBuilder,

    private router: Router,
    private toastr: ToastrService
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    const maxDateObj = new Date();
    maxDateObj.setMonth(maxDateObj.getMonth() + 6);
    this.maxDate = maxDateObj.toISOString().split('T')[0];

    this.bookingForm = this.fb.group({
      // Step 1: Search Criteria
      checkInDate: ['', [Validators.required]],
      checkOutDate: ['', [Validators.required]],
      adults: [2, [Validators.required, Validators.min(1), Validators.max(10)]],
      children: [0, [Validators.min(0), Validators.max(5)]],

      // Step 3: Guest Details
      guestName: ['', [Validators.required, Validators.minLength(3)]],
      guestEmail: ['', [Validators.required, Validators.email]],
      guestPhone: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      specialRequests: [''],

      // Step 4: Payment
      paymentMethod: ['paystack', [Validators.required]]
    });

    // Validate dates
    this.bookingForm.get('checkInDate')?.valueChanges.subscribe(() => {
      this.validateDates();
      if (this.selectedRoom) {
        this.calculateTotal();
      }
    });

    this.bookingForm.get('checkOutDate')?.valueChanges.subscribe(() => {
      this.validateDates();
      if (this.selectedRoom) {
        this.calculateTotal();
      }
    });

    this.bookingForm.get('adults')?.valueChanges.subscribe(() => {
      if (this.selectedRoom) {
        this.validateRoomCapacity();
      }
    });

    this.bookingForm.get('children')?.valueChanges.subscribe(() => {
      if (this.selectedRoom) {
        this.validateRoomCapacity();
      }
    });
  }

  ngOnInit(): void {
    // Set default dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.bookingForm.patchValue({
      checkInDate: today.toISOString().split('T')[0],
      checkOutDate: tomorrow.toISOString().split('T')[0]
    });
  }

  validateDates(): void {
    const checkIn = this.bookingForm.get('checkInDate')?.value;
    const checkOut = this.bookingForm.get('checkOutDate')?.value;

    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      this.bookingForm.get('checkOutDate')?.setErrors({ invalid: 'Check-out must be after check-in' });
    } else {
      this.bookingForm.get('checkOutDate')?.setErrors(null);
    }
  }

  searchRooms(): void {
    if (this.bookingForm.get('checkInDate')?.invalid ||
        this.bookingForm.get('checkOutDate')?.invalid) {
      this.toastr.warning('Please select valid dates', 'Invalid Dates');
      return;
    }

    this.isSearching = true;
    const searchCriteria = {
      checkInDate: new Date(this.bookingForm.get('checkInDate')?.value),
      checkOutDate: new Date(this.bookingForm.get('checkOutDate')?.value),
      adults: this.bookingForm.get('adults')?.value,
      children: this.bookingForm.get('children')?.value
    };

    this.roomService.checkAvailability(searchCriteria).subscribe({
      next: (response:any) => {
        this.availableRooms = response.data;
        this.isSearching = false;
        this.step = 2;

        if (this.availableRooms.length === 0) {
          this.toastr.warning('No rooms available for selected dates', 'No Availability');
        }
      },
      error: (error) => {
        this.isSearching = false;
        this.toastr.error(error.message || 'Failed to search rooms', 'Error');
      }
    });
  }

  selectRoom(room: Room): void {
    this.selectedRoom = room;
    this.validateRoomCapacity();
    this.calculateTotal();
    this.step = 3;
  }

  validateRoomCapacity(): boolean {
    const adults = this.bookingForm.get('adults')?.value;
    const children = this.bookingForm.get('children')?.value;

    if (this.selectedRoom) {
      if (adults > this.selectedRoom.maxAdults) {
        this.toastr.warning(`This room only accommodates ${this.selectedRoom.maxAdults} adults`, 'Capacity Exceeded');
        return false;
      }
      if (children > this.selectedRoom.maxChildren) {
        this.toastr.warning(`This room only accommodates ${this.selectedRoom.maxChildren} children`, 'Capacity Exceeded');
        return false;
      }
    }
    return true;
  }

  calculateTotal(): void {
    const checkIn = new Date(this.bookingForm.get('checkInDate')?.value);
    const checkOut = new Date(this.bookingForm.get('checkOutDate')?.value);
    this.totalNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (this.selectedRoom && this.totalNights > 0) {
      this.subtotal = this.selectedRoom.pricePerNight * this.totalNights;
      this.taxAmount = this.subtotal * 0.075; // 7.5% VAT
      this.totalAmount = this.subtotal + this.taxAmount;
    }
  }

  goBack(): void {
    if (this.step > 1) {
      this.step--;
    } else {
      this.router.navigate(['/bookings']);
    }
  }

  proceedToPayment(): void {
    if (this.bookingForm.get('guestName')?.invalid) {
      this.toastr.warning('Please enter guest name', 'Missing Information');
      return;
    }
    if (this.bookingForm.get('guestEmail')?.invalid) {
      this.toastr.warning('Please enter valid email address', 'Missing Information');
      return;
    }
    if (this.bookingForm.get('guestPhone')?.invalid) {
      this.toastr.warning('Please enter valid phone number', 'Missing Information');
      return;
    }

    this.step = 4;
  }

  createBooking(): void {
    if (!this.validateRoomCapacity()) {
      return;
    }

    this.isLoading = true;

    const bookingRequest: CreateBookingRequest = {
      roomId: this.selectedRoom!.roomId,
      checkInDate: new Date(this.bookingForm.get('checkInDate')?.value),
      checkOutDate: new Date(this.bookingForm.get('checkOutDate')?.value),
      numberOfAdults: this.bookingForm.get('adults')?.value,
      numberOfChildren: this.bookingForm.get('children')?.value,
      specialRequests: this.bookingForm.get('specialRequests')?.value
    };

    this.bookingService.createBooking(bookingRequest).subscribe({
      next: (response:any) => {
        this.isLoading = false;
        if (response.success) {
          this.toastr.success('Booking created successfully!', 'Success');

          // If there's a payment URL, redirect to payment
          if (response.paymentUrl) {
            window.location.href = response.paymentUrl;
          } else {
            this.router.navigate(['/bookings/detail', response.data.bookingId]);
          }
        } else {
          this.toastr.error(response.message || 'Failed to create booking', 'Error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.toastr.error(error.message || 'Failed to create booking', 'Error');
      }
    });
  }

  formatPrice(price: number): string {
    return `₦${price.toLocaleString()}`;
  }
}
