// src/app/modules/bookings/pages/create-booking/create-booking.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BookingService } from '../../../../core/services/booking.service';

import { CreateBookingRequest } from '../../../../core/models/booking.model';
import { RoomService } from '../../../../core/services/room.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { FilterRoomsPipe } from '../../../../core/pipes/filter-rooms-pipe';

interface Room {
  roomId: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  maxAdults: number;
  maxChildren: number;
  amenities: string[];
}
import  PaystackPop from '@paystack/inline-js';
@Component({
  selector: 'app-create-booking',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule,NgxPaginationModule, FilterRoomsPipe],
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

  currentPage = 1;
  itemsPerPage = 6;
  pageSizeOptions = [6, 12, 24, 48];

  private bookingService: BookingService = inject(BookingService);
    private roomService: RoomService = inject(RoomService);
    cdr =inject(ChangeDetectorRef)
    searchTerm:string = '';
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


       numberOfAdults:[2, [Validators.required, Validators.min(1), Validators.max(10)]] ,
      numberOfChildren:  [0, [Validators.min(0), Validators.max(5)]],
      roomId: [0],
      // Step 3: Guest Details
      guestFirstName: ['', [Validators.required, Validators.minLength(3)]],
      guestLastName: ['', [Validators.required, Validators.minLength(3)]],
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

    this.bookingForm.get('numberOfAdults')?.valueChanges.subscribe(() => {
      if (this.selectedRoom) {
        this.validateRoomCapacity();
      }
    });

    this.bookingForm.get('numberOfChildren')?.valueChanges.subscribe(() => {
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



 onPageChange(page: number): void {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }



  searchRooms(): void {
    if (this.bookingForm.get('checkInDate')?.invalid ||
        this.bookingForm.get('checkOutDate')?.invalid) {
      this.toastr.warning('Please select valid dates', 'Invalid Dates');
      return;
    }

    this.isSearching = true;
    const searchCriteria = {
      checkIn: formatDate(this.bookingForm.get('checkInDate')?.value, 'yyyy-MM-dd', 'en-US'),
      checkOut: formatDate(this.bookingForm.get('checkOutDate')?.value, 'yyyy-MM-dd', 'en-US'),
      adults: this.bookingForm.get('numberOfAdults')?.value,
      children: this.bookingForm.get('numberOfChildren')?.value,
      roomTypeId:null
    };
//console.log('Searching rooms with criteria:', searchCriteria);
    this.roomService.checkAvailability(searchCriteria).subscribe({
      next: (response:any) => {
        this.availableRooms = response.data;
        this.isSearching = false;
        this.step = 2;
this.cdr.detectChanges();
        if (this.availableRooms.length === 0) {
          this.toastr.warning('No rooms available for selected dates', 'No Availability');
        }
      },
      error: (error) => {
        this.isSearching = false;
        this.cdr.detectChanges();
        this.toastr.error(error.message || 'Failed to search rooms', 'Error');
        console.error('Error searching rooms:', error);
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
    const adults = this.bookingForm.get('numberOfAdults')?.value;
    const children = this.bookingForm.get('numberOfChildren')?.value;

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
    if (this.bookingForm.get('guestFirstName')?.invalid) {
      this.toastr.warning('Please enter guest name', 'Missing Information');
      return;
    }
     if (this.bookingForm.get('guestLastName')?.invalid) {
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
      numberOfAdults: this.bookingForm.get('numberOfAdults')?.value,
      numberOfChildren: this.bookingForm.get('numberOfChildren')?.value,
      specialRequests: this.bookingForm.get('specialRequests')?.value
    };
     this.bookingForm.value.roomId = this.selectedRoom!.roomId;
    this.bookingService.createBooking(this.bookingForm.value).subscribe({
      next: (response:any) => {
        console.log('Create Booking Response:', response);
        this.isLoading = false;
        if (response.success) {
          this.toastr.success('Booking created successfully!', 'Success');
  this.cdr.detectChanges();

            this.payWithPaystack(response.data);

        } else {
          this.toastr.error(response.message || 'Failed to create booking', 'Error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.toastr.error(error.message || 'Failed to create booking', 'Error');
        this.cdr.detectChanges();
        console.error('Error creating booking:', error);
      }
    });
  }
payWithPaystack(bookingData: any): void {
 // console.log('Initiating Paystack payment with data:', bookingData);
    const paystack = new PaystackPop();

    paystack.newTransaction({
      key:bookingData.paystackKey , // Replace with your Public Key
      email: this.bookingForm.get('guestEmail')?.value,
      amount: Math.round(this.totalAmount * 100), // Paystack operates strictly in minor unit variants (kobo for NGN)
      currency: 'NGN',
      reference: bookingData.bookingReference || 'BK-' + bookingData.bookingId + '-' + Date.now(),
      metadata: {
        custom_fields: [
          {
            display_name: "Guest Name",
            variable_name: "guest_name",
            value: `${this.bookingForm.get('guestFirstName')?.value} ${this.bookingForm.get('guestLastName')?.value}`
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
        // this.router.navigate(['/bookings/detail', bookingData.bookingId], {
        //   queryParams: { reference: transaction.reference }
        // });
      },
      onCancel: () => {
        this.isLoading = false;
        this.toastr.info('Payment window closed. You can fulfill this payment via your dashboard later.', 'Payment Cancelled');
        this.router.navigate(['/bookings/detail', bookingData.bookingId]);
        this.cdr.detectChanges();
      }
    });
  }

  private confirmAndMarkAsPaid(bookingId: number, transactionReference: string): void {
  // 4. Send a localized update or verification ping immediately to update paymentStatus as paid
  this.bookingService.updatePaymentStatus( bookingId,{
    record:"New Payment",
    paymentStatus:"Paid",
    status: 'Success',
    reference: transactionReference
  }).subscribe({
    next: (updateResponse: any) => {
      this.isLoading = false;
      this.toastr.success('Payment successfully authorized & validated!', 'Success');

      // Send them straight to their finalized reservation receipt dashboard view
      this.router.navigate(['/bookings/detail', bookingId]);
    },
    error: (err: any) => {
      this.isLoading = false;
      this.toastr.warning('Payment was processed but verification failed. Our team will review your order.', 'Verification Warning');
      this.router.navigate(['/bookings/detail', bookingId]);
      console.error('Error updating payment status:', err);
    }
  });
}
  formatPrice(price: number): string {
    return `₦${price.toLocaleString()}`;
  }
}
