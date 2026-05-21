// src/app/core/models/booking.model.ts
export interface Booking {
  bookingId: number;
  bookingReference: string;
  userId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: number;
  roomNumber: string;
  roomType: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfAdults: number;
  numberOfChildren: number;
  totalNights: number;
  roomPricePerNight: number;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  specialRequests: string;
  bookingStatus: 'Pending' | 'Confirmed' | 'CheckedIn' | 'CheckedOut' | 'Cancelled' | 'NoShow';
  paymentStatus: 'Pending' | 'Paid' | 'PartiallyPaid' | 'Refunded' | 'Failed'| 'Success';
  bookingDate: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
}

export interface BookingFilter {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  guestName?: string;
  roomNumber?: string;
  page: number;
  pageSize: number;
}

export interface BookingPagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface CreateBookingRequest {
  roomId: number;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfAdults: number;
  numberOfChildren: number;
  specialRequests?: string;
}

// export interface BookingStats {
//   totalBookings: number;
//   confirmedBookings: number;
//   checkedIn: number;
//   checkedOut: number;
//   cancelled: number;
//   pendingPayments: number;
//   totalRevenue: number;
//   occupancyRate: number;
// }
// // src/app/core/models/booking.model.ts
// // Update the BookingStats interface

export interface BookingStats {
  totalBookings: number;
  confirmedBookings: number;
  checkedIn: number;
  checkedOut: number;
  cancelled: number;
  pendingPayments: number;
  totalRevenue: number;
  occupancyRate: number;
  // Add these if your backend returns them
  todayCheckIns?: number;
  todayCheckOuts?: number;
  pendingBookings?: number;
  dailyRevenue?: number;
  weeklyRevenue?: number;
  monthlyRevenue?: number;
  yearlyRevenue?: number;
  cancelledBookings?:number
}
