import { inject, Inject } from '@angular/core';
// dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentDate = new Date();
  currentTime = '';
  revenuePeriod = 'month';
  private timerInterval: any;

  recentBookings = [
    { guestName: 'John Doe', roomNumber: '1204', dates: 'May 15 - May 18', status: 'confirmed' },
    { guestName: 'Jane Smith', roomNumber: '805', dates: 'May 14 - May 17', status: 'confirmed' },
    { guestName: 'Michael Johnson', roomNumber: '1502', dates: 'May 13 - May 16', status: 'pending' },
  ];

  upcomingCheckouts = [
    { guestName: 'Sarah Williams', roomNumber: '901', time: '11:00 AM' },
    { guestName: 'David Brown', roomNumber: '304', time: '12:30 PM' },
  ];

 // dashboard.component.ts
staffOnDuty = [
  {
    name: 'Alice Manager',
    role: 'Front Desk Manager',
    department: 'Front Desk',
    shift: 'Morning',
    isOnline: true,
    avatar: 'assets/images/avatars/alice.jpg',
    initials: 'AM',
    color: 'bg-blue-500'
  },
  {
    name: 'Bob Housekeeper',
    role: 'Senior Housekeeper',
    department: 'Housekeeping',
    shift: 'Morning',
    isOnline: true,
    avatar: 'assets/images/avatars/bob.jpg',
    initials: 'BH',
    color: 'bg-green-500'
  },
  {
    name: 'Carol Security',
    role: 'Security Officer',
    department: 'Security',
    shift: 'Night',
    isOnline: false,
    avatar: 'assets/images/avatars/carol.jpg',
    initials: 'CS',
    color: 'bg-purple-500'
  },
  {
    name: 'David Technician',
    role: 'Maintenance',
    department: 'Engineering',
    shift: 'Afternoon',
    isOnline: true,
    avatar: 'assets/images/avatars/david.jpg',
    initials: 'DT',
    color: 'bg-orange-500'
  },
  {
    name: 'Emma Receptionist',
    role: 'Front Desk',
    department: 'Front Desk',
    shift: 'Evening',
    isOnline: false,
    avatar: 'assets/images/avatars/emma.jpg',
    initials: 'ER',
    color: 'bg-pink-500'
  }
];
public authService= inject(AuthService);
  constructor() {}

  ngOnInit(): void {
    this.updateTime();
    this.timerInterval = setInterval(() => this.updateTime(), 1000);
    this.loadRevenueData();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  loadRevenueData(): void {
    // Implement chart data loading based on selected period
    console.log('Loading revenue data for period:', this.revenuePeriod);
  }

  getBookingStatusClass(status: string): string {
    return status;
  }

  getBookingIcon(status: string): string {
    switch(status) {
      case 'confirmed': return 'fas fa-check-circle';
      case 'pending': return 'fas fa-clock';
      case 'cancelled': return 'fas fa-times-circle';
      default: return 'fas fa-calendar-check';
    }
  }

  newBooking(): void {
    // Navigate to new booking page
  }

  checkIn(): void {
    // Open check-in modal
  }

  checkOut(): void {
    // Open check-out modal
  }

  viewReports(): void {
    // Navigate to reports page
  }
}
