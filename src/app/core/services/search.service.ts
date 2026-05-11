// src/app/core/services/search.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SearchResult {
  id: number;
  title: string;
  subtitle: string;
  type: 'booking' | 'guest' | 'room' | 'staff' | 'inventory' | 'page';
  icon: string;
  routerLink: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  globalSearch(query: string): Observable<SearchResult[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    // Search from API
    return this.http.get<SearchResult[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`)
      .pipe(
        catchError(() => {
          // Fallback to local search if API fails
          return of(this.localSearch(query));
        })
      );
  }

  private localSearch(query: string): SearchResult[] {
    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // Page navigation results
    const pages = [
      { title: 'Dashboard', routerLink: '/dashboard', icon: 'fas fa-tachometer-alt', color: 'blue' },
      { title: 'Bookings', routerLink: '/bookings', icon: 'fas fa-calendar-check', color: 'green' },
      { title: 'New Booking', routerLink: '/bookings/new', icon: 'fas fa-plus-circle', color: 'teal' },
      { title: 'Rooms', routerLink: '/rooms', icon: 'fas fa-bed', color: 'purple' },
      { title: 'Room Status', routerLink: '/rooms/status', icon: 'fas fa-chart-line', color: 'indigo' },
      { title: 'Staff', routerLink: '/staff', icon: 'fas fa-users', color: 'orange' },
      { title: 'Staff Directory', routerLink: '/staff/directory', icon: 'fas fa-address-card', color: 'pink' },
      { title: 'Shift Scheduling', routerLink: '/staff/schedules', icon: 'fas fa-calendar-alt', color: 'red' },
      { title: 'Housekeeping', routerLink: '/housekeeping', icon: 'fas fa-broom', color: 'yellow' },
      { title: 'Housekeeping Tasks', routerLink: '/housekeeping/tasks', icon: 'fas fa-tasks', color: 'green' },
      { title: 'Inventory', routerLink: '/inventory', icon: 'fas fa-boxes', color: 'blue' },
      { title: 'Stock Items', routerLink: '/inventory/items', icon: 'fas fa-cubes', color: 'indigo' },
      { title: 'Reports', routerLink: '/reports', icon: 'fas fa-chart-bar', color: 'purple' },
      { title: 'Settings', routerLink: '/settings', icon: 'fas fa-cog', color: 'gray' },
      { title: 'Profile', routerLink: '/settings/profile', icon: 'fas fa-user', color: 'teal' },
    ];

    // Filter pages
    pages.forEach(page => {
      if (page.title.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: results.length + 1,
          title: page.title,
          subtitle: 'Navigation',
          type: 'page',
          icon: page.icon,
          routerLink: page.routerLink,
          color: page.color
        });
      }
    });

    return results;
  }

  // Search bookings by guest name or booking ID
  searchBookings(query: string): Observable<SearchResult[]> {
    return this.http.get<SearchResult[]>(`${this.apiUrl}/search/bookings?q=${encodeURIComponent(query)}`)
      .pipe(catchError(() => of([])));
  }

  // Search guests by name or email
  searchGuests(query: string): Observable<SearchResult[]> {
    return this.http.get<SearchResult[]>(`${this.apiUrl}/search/guests?q=${encodeURIComponent(query)}`)
      .pipe(catchError(() => of([])));
  }

  // Search rooms by number or type
  searchRooms(query: string): Observable<SearchResult[]> {
    return this.http.get<SearchResult[]>(`${this.apiUrl}/search/rooms?q=${encodeURIComponent(query)}`)
      .pipe(catchError(() => of([])));
  }

  // Search staff by name or role
  searchStaff(query: string): Observable<SearchResult[]> {
    return this.http.get<SearchResult[]>(`${this.apiUrl}/search/staff?q=${encodeURIComponent(query)}`)
      .pipe(catchError(() => of([])));
  }

   getResultColor = (type: string): string => {
  switch(type) {
    case 'booking': return 'green';
    case 'guest': return 'blue';
    case 'room': return 'purple';
    case 'staff': return 'orange';
    case 'inventory': return 'teal';
    case 'page': return 'gray';
    default: return 'gray';
  }
};
}
