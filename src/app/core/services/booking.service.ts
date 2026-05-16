// src/app/core/services/booking.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, BookingFilter, BookingPagination, BookingStats, CreateBookingRequest } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  // Get all bookings with filters
  getBookings(filter: BookingFilter): Observable<{ data: Booking[]; pagination: BookingPagination }> {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.status) params = params.set('status', filter.status);
    if (filter.startDate) params = params.set('startDate', filter.startDate.toISOString());
    if (filter.endDate) params = params.set('endDate', filter.endDate.toISOString());
    if (filter.guestName) params = params.set('guestName', filter.guestName);
    if (filter.roomNumber) params = params.set('roomNumber', filter.roomNumber);

    return this.http.get<{ data: Booking[]; pagination: BookingPagination }>(this.apiUrl, { params });
  }

  // Get booking by ID
  getBookingById(id: number): Observable<{ success: boolean; data: Booking }> {
    return this.http.get<{ success: boolean; data: Booking }>(`${this.apiUrl}/${id}`);
  }

  // Get booking by reference
  getBookingByReference(reference: string): Observable<{ success: boolean; data: Booking }> {
    return this.http.get<{ success: boolean; data: Booking }>(`${this.apiUrl}/reference/${reference}`);
  }

  // Create new booking
  createBooking(request: CreateBookingRequest): Observable<{ success: boolean; data: Booking; paymentUrl?: string }> {
    return this.http.post<{ success: boolean; data: Booking; paymentUrl?: string }>(this.apiUrl, request);
  }

  // Update booking
  updateBooking(id: number, data: Partial<Booking>): Observable<{ success: boolean; data: Booking }> {
    return this.http.put<{ success: boolean; data: Booking }>(`${this.apiUrl}/${id}`, data);
  }

  // Cancel booking
  cancelBooking(id: number, reason: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/cancel`, { reason });
  }

  // Check-in guest
  checkIn(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/checkin`, {});
  }

  // Check-out guest
  checkOut(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/checkout`, {});
  }

  // Get booking statistics
  getBookingStats(): Observable<{ success: boolean; data: BookingStats }> {
    return this.http.get<{ success: boolean; data: BookingStats }>(`${this.apiUrl}/stats`);
  }

  // Get today's arrivals (for check-in)
  getTodaysArrivals(): Observable<{ success: boolean; data: Booking[] }> {
    return this.http.get<{ success: boolean; data: Booking[] }>(`${this.apiUrl}/today-arrivals`);
  }

  // Get today's departures (for check-out)
  getTodaysDepartures(): Observable<{ success: boolean; data: Booking[] }> {
    return this.http.get<{ success: boolean; data: Booking[] }>(`${this.apiUrl}/today-departures`);
  }

 
}
