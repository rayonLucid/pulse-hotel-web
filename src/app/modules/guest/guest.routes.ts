// src/app/modules/guest/guest.routes.ts
import { Routes } from '@angular/router';
import { GuestLayoutComponent } from './guest-layout/guest-layout.component';
import { GuestAuthGuard } from '../../core/auth/guest-auth.guard';


export const GUEST_ROUTES: Routes = [
  {
    path: '',
    component: GuestLayoutComponent,
    canActivate: [GuestAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./guest-dashboard/guest-dashboard.component').then(m => m.GuestDashboardComponent) },
      { path: 'bookings/new', loadComponent: () => import('./booking-wizard/booking-wizard.component').then(m => m.BookingWizardComponent) },
      { path: 'my-bookings', loadComponent: () => import('./my-bookings/my-bookings.component').then(m => m.MyBookingsComponent) },
      { path: 'service-requests', loadComponent: () => import('./service-requests/service-requests.component').then(m => m.ServiceRequestsComponent) },
      { path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'change-password', loadComponent: () => import('./change-password/change-password.component').then(m => m.ChangePasswordComponent) }
    ]
  }
];
