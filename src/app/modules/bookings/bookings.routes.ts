// src/app/modules/bookings/bookings.routes.ts
import { Routes } from '@angular/router';
import { BookingsListComponent } from './pages/bookings-list/bookings-list/bookings-list.component';
import { CreateBookingComponent } from './pages/create-booking/create-booking.component';
import { BookingDetailComponent } from './pages/booking-detail/booking-detail.component';
import { CheckInOutComponent } from './pages/check-in-out/check-in-out.component';


export const BOOKINGS_ROUTES: Routes = [
  { path: '', component: BookingsListComponent },
  { path: 'list', component: BookingsListComponent },
  { path: 'new', component: CreateBookingComponent },
  { path: 'detail/:id', component: BookingDetailComponent },
  { path: 'check-in-out', component: CheckInOutComponent },
  { path: '**', redirectTo: 'list' }
];
