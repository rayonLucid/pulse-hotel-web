import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppConfigService } from './app.config.service';
import { CreateBookingRequest } from '../models/booking.model';


export interface GuestUser {
  guestId: number;
  firstName: string;
  lastName: string;
  email: string;
  loyaltyPoints: number;
  token: string;
}

export interface GuestDashboard {
  upcomingBookings: any[];
  pastBookings: any[];
  profile: GuestUser;
}

// export interface CreateBookingRequest {
//   roomId: number;
//   checkInDate: string;
//   checkOutDate: string;
//   numberOfAdults: number;
//   numberOfChildren: number;
//   specialRequests?: string;
// }

export interface ServiceRequest {
  requestId: number;
  bookingId: number;
  bookingReference: string;
  requestType: string;
  requestDetails: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class GuestService {
  private http = inject(HttpClient);
  private config = inject(AppConfigService);
  private apiUrl = `${this.config.apiUrl}/guest`;

  private guestUserSubject = new BehaviorSubject<GuestUser | null>(null);
  guestUser$ = this.guestUserSubject.asObservable();

  constructor() {
    const stored = localStorage.getItem('guestUser');
    if (stored) this.guestUserSubject.next(JSON.parse(stored));
  }

  private setGuestUser(user: GuestUser | null) {
    if (user) {
      localStorage.setItem('guestUser', JSON.stringify(user));
      this.guestUserSubject.next(user);
    } else {
      localStorage.removeItem('guestUser');
      this.guestUserSubject.next(null);
    }
  }

  getGuestUser(): GuestUser | null {
    return this.guestUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<{ success: boolean; data: GuestUser }>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(res => {
        if (res.success && res.data) {
          this.setGuestUser(res.data);
        }
      }));
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout() {
    this.setGuestUser(null);
  }

  getDashboard(): Observable<{ success: boolean; data: GuestDashboard }> {
    return this.http.get<{ success: boolean; data: GuestDashboard }>(`${this.apiUrl}/dashboard`);
  }

  createBooking(request: CreateBookingRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings`, request);
  }

  getMyBookings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/bookings`);
  }

  cancelBooking(bookingId: number, reason?: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bookings/${bookingId}`, { params: { reason: reason || '' } });
  }

  getServiceRequests(): Observable<{ success: boolean; data: ServiceRequest[] }> {
    return this.http.get<{ success: boolean; data: ServiceRequest[] }>(`${this.apiUrl}/service-requests`);
  }

  createServiceRequest(data: { bookingId: number; requestType: string; requestDetails?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/service-requests`, data);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  updateProfile(data: { firstName: string; lastName: string; phoneNumber: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, data);
  }

  getAvailableRooms(checkIn: string, checkOut: string, roomTypeId?: number): Observable<any> {
    let params: any = { checkIn, checkOut };
    if (roomTypeId) params.roomTypeId = roomTypeId;
    return this.http.get(`${this.apiUrl}/available-rooms`, { params });
  }
}
