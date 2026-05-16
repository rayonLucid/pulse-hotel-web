// src/app/modules/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Chart from 'chart.js/auto';
import { AuthService } from '../../../core/auth/auth.service';
import { DashboardData } from '../../../core/models/dashboard.model';
import { DashboardService } from '../../../core/services/dashboard.service';
import { interval, Subscription, switchMap } from 'rxjs';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  // Dashboard Data - directly using DashboardData interface
  dashboardData: DashboardData | null = null;

  // UI State
  isLoading = true;
  currentTime = new Date();
  currentDate = new Date();
  revenuePeriod: 'week' | 'month' | 'year' = 'month';

  // Charts
  revenueChart: Chart | null = null;
  occupancyChart: Chart | null = null;
  private timerInterval: any;
lastUpdated: Date | null = null;
  public authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
changeDet =inject(ChangeDetectorRef)

  isRefreshing: any;

  // Timers

  private refreshInterval: any;
  private readonly REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

 private refreshSubscription: Subscription | null = null;
  ngOnInit(): void {
    this.loadDashboardData();
    this.startTimer();
   // this.startAutoRefresh();
    this.startAutoRefreshRxJS()
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }
startAutoRefreshRxJS(): void {
    // Refresh every 5 minutes using RxJS
    this.refreshSubscription = interval(5 * 60 * 1000)
      .pipe(
        switchMap(async () => {
          console.log('Auto-refreshing dashboard data...');
          await this.loadDashboardData();
        })
      )
      .subscribe({
        error: (error:any) => {
          console.error('Auto-refresh error:', error);
        }
      });
  }

   startAutoRefresh(): void {
    // Refresh data every 5 minutes
    this.refreshInterval = setInterval(() => {
      this.refreshDashboardData();
    }, this.REFRESH_INTERVAL_MS);

    // Log that auto-refresh is enabled
   // console.log(`Auto-refresh enabled: Dashboard will refresh every ${this.REFRESH_INTERVAL_MS / 1000 / 60} minutes`);
  }
getLastUpdatedTime(): string {
    if (!this.lastUpdated) return 'Never';
    return this.lastUpdated.toLocaleTimeString();
  }

  async refreshDashboardData(): Promise<void> {
    if (this.isRefreshing) {
      console.log('Refresh already in progress, skipping...');
      return;
    }

    this.isRefreshing = true;

    try {
      await this.loadDashboardData();
      this.toastr.info('Dashboard data refreshed', 'Auto-Refresh', {
        timeOut: 3000,
        positionClass: 'toast-top-right'
      });
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      this.toastr.warning('Failed to refresh dashboard data', 'Refresh Error');
    } finally {
      this.isRefreshing = false;
    }
  }

  async manualRefresh(): Promise<void> {
    if (this.isRefreshing || this.isLoading) {
      this.toastr.warning('Please wait, data is already loading', 'Refresh in Progress');
      return;
    }

    this.toastr.info('Refreshing dashboard data...', 'Refreshing');
    await this.refreshDashboardData();
  }

getTimeUntilNextRefresh(): string {
    if (!this.refreshInterval) return 'Unknown';

    const now = Date.now();
    const nextRefresh = Math.ceil(now / this.REFRESH_INTERVAL_MS) * this.REFRESH_INTERVAL_MS;
    const timeLeft = nextRefresh - now;
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
//this.changeDet.detectChanges()
    return `${minutes}m ${seconds}s`;
  }
 ngOnDestroy(): void {
    // Clear all intervals
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.revenueChart) {
      this.revenueChart.destroy();
    }
    if (this.occupancyChart) {
      this.occupancyChart.destroy();
    }
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  async loadDashboardData(): Promise<void> {
    this.isLoading = true;

    try {
      const response = await this.dashboardService.getDashboardData().toPromise();
              //console.log(response)
      if (response?.success && response.data) {
        this.dashboardData = response.data;
        this.isLoading =false
        this.changeDet.detectChanges()
      } else {
        this.setFallbackData();
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      this.setFallbackData();
      this.isLoading =false
this.changeDet.detectChanges()
    } finally {
      this.isLoading = false;
      this.updateCharts();
      this.changeDet.detectChanges()
    }
  }

  setFallbackData(): void {
    this.dashboardData = {
      roomStats: {
        totalRooms: 250,
        availableRooms: 85,
        occupiedRooms: 120,
        maintenanceRooms: 15,
        cleaningRooms: 20,
        reservedRooms: 10,
        occupancyRate: 68
      },
      bookingStats: {
        totalBookings: 1245,
        confirmedBookings: 120,
        todayCheckIns: 32,
        todayCheckOuts: 28,
        pendingBookings: 15,
        totalRevenue: 18500000,
        dailyRevenue: 620000,
        weeklyRevenue: 4350000,
        monthlyRevenue: 18500000,
        yearlyRevenue: 195000000
      },
      recentBookings: [
        { bookingId: 1, guestName: 'John Doe', roomNumber: '1204', checkInDate: new Date(), checkOutDate: new Date(Date.now() + 86400000 * 3), status: 'Confirmed', totalAmount: 182750 },
        { bookingId: 2, guestName: 'Jane Smith', roomNumber: '805', checkInDate: new Date(), checkOutDate: new Date(Date.now() + 86400000 * 2), status: 'Confirmed', totalAmount: 483750 },
        { bookingId: 3, guestName: 'Michael Johnson', roomNumber: '1502', checkInDate: new Date(), checkOutDate: new Date(Date.now() + 86400000), status: 'Pending', totalAmount: 129000 }
      ],
      upcomingCheckouts: [
        { bookingId: 1, guestName: 'Sarah Williams', roomNumber: '901', checkOutDate: new Date() },
        { bookingId: 2, guestName: 'David Brown', roomNumber: '304', checkOutDate: new Date() }
      ],
      staffOnDuty: [
        { staffId: 1, name: 'Alice Manager', role: 'Front Desk Manager', department: 'Front Desk', isOnline: true, shift: 'Morning' },
        { staffId: 2, name: 'Bob Housekeeper', role: 'Senior Housekeeper', department: 'Housekeeping', isOnline: true, shift: 'Morning' },
        { staffId: 3, name: 'Carol Security', role: 'Security Officer', department: 'Security', isOnline: false, shift: 'Night' }
      ],
      housekeepingStats: {
        dirtyRooms: 35,
        cleaningInProgress: 20,
        cleanRooms: 150,
        inspectedRooms: 120
      }
    };
  }

  initCharts(): void {
    this.initRevenueChart();
    this.initOccupancyChart();
  }

  updateCharts(): void {
    if (this.occupancyChart && this.dashboardData) {
      this.occupancyChart.data.datasets[0].data = [
        this.dashboardData.roomStats.availableRooms,
        this.dashboardData.roomStats.occupiedRooms,
        this.dashboardData.roomStats.maintenanceRooms,
        this.dashboardData.roomStats.cleaningRooms,
        this.dashboardData.roomStats.reservedRooms
      ];
      this.occupancyChart.update();
    }
  }

  initRevenueChart(): void {
    const canvas = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Revenue (₦)',
          data: [1250000, 1500000, 1800000, 2200000, 2500000, 2800000, 2100000],
          borderColor: '#c49a6c',
          backgroundColor: 'rgba(196, 154, 108, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#c49a6c',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context:any) => `₦${context.raw.toLocaleString()}`
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: (value) => `₦${(Number(value) / 1000000).toFixed(1)}M`
            }
          }
        }
      }
    });
  }

  initOccupancyChart(): void {
    const canvas = document.getElementById('occupancyChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!this.dashboardData) return;

    this.occupancyChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Available', 'Occupied', 'Maintenance', 'Cleaning', 'Reserved'],
        datasets: [{
          data: [
            this.dashboardData.roomStats.availableRooms,
            this.dashboardData.roomStats.occupiedRooms,
            this.dashboardData.roomStats.maintenanceRooms,
            this.dashboardData.roomStats.cleaningRooms,
            this.dashboardData.roomStats.reservedRooms
          ],
          backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 15, font: { size: 12 }, usePointStyle: true }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw as number;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} rooms (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  loadRevenueData(): void {
    if (!this.revenueChart) return;

    let data: number[] = [];
    let labels: string[] = [];

    switch(this.revenuePeriod) {
      case 'week':
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        data = [1250000, 1500000, 1800000, 2200000, 2500000, 2800000, 2100000];
        break;
      case 'month':
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        data = [8500000, 9200000, 10100000, 11500000];
        break;
      case 'year':
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        data = [8500000, 9200000, 10100000, 11500000, 12800000, 13500000, 14200000, 13800000, 14500000, 15200000, 16800000, 18500000];
        break;
    }

    this.revenueChart.data.labels = labels;
    this.revenueChart.data.datasets[0].data = data;
    this.revenueChart.update();
  }

  getBookingStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Confirmed': 'confirmed',
      'Pending': 'pending',
      'Cancelled': 'cancelled',
      'CheckedIn': 'checked-in',
      'CheckedOut': 'checked-out'
    };
    return classes[status] || 'pending';
  }

  getBookingIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'Confirmed': 'fas fa-check-circle',
      'Pending': 'fas fa-clock',
      'Cancelled': 'fas fa-times-circle',
      'CheckedIn': 'fas fa-sign-in-alt',
      'CheckedOut': 'fas fa-sign-out-alt'
    };
    return icons[status] || 'fas fa-calendar-check';
  }

  getOccupancyRate(): number {
    return this.dashboardData?.roomStats?.occupancyRate || 0;
  }

  getTotalRevenue(): number {
    if (!this.dashboardData) return 0;
    switch(this.revenuePeriod) {
      case 'week': return this.dashboardData.bookingStats.weeklyRevenue || 0;
      case 'month': return this.dashboardData.bookingStats.monthlyRevenue || 0;
      case 'year': return this.dashboardData.bookingStats.yearlyRevenue || 0;
      default: return this.dashboardData.bookingStats.monthlyRevenue || 0;
    }
  }

  getTotalRevenueInMillions(): string {
    const revenue = this.getTotalRevenue();
    return (revenue / 1000000).toFixed(1);
  }

  getRevenueGrowthPercentage(): string {
    const growth = 8.5;
    return growth.toFixed(1);
  }

  getStaffInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  newBooking(): void {
    this.router.navigate(['/bookings/new']);
  }

  checkIn(): void {
    this.router.navigate(['/bookings/check-in-out']);
  }

  checkOut(): void {
    this.router.navigate(['/bookings/check-in-out']);
  }

  viewReports(): void {
    this.router.navigate(['/reports']);
  }
}
