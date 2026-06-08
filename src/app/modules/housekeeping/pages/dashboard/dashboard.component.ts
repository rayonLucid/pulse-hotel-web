// src/app/modules/housekeeping/pages/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HousekeepingService } from '../../../../core/services/housekeeping.service';
import { DashboardStats, RoomStatus, HousekeepingTask } from '../../../../core/models/housekeeping.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-housekeeping-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class HouseKeepingDashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats | null = null;
  roomStatuses: RoomStatus[] = [];
  pendingTasks: HousekeepingTask[] = [];
  urgentTasks: HousekeepingTask[] = [];
  recentInspections: any[] = [];
  isLoading = true;
  currentTime = new Date();
  private refreshInterval: any;
  private timeInterval: any;
toastr = inject(ToastrService);
cdr = inject(ChangeDetectorRef);
  constructor(private housekeepingService: HousekeepingService) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.startAutoRefresh();
    this.startClock();
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  /**
   * Load all dashboard data
   */
   loadDashboardData(): void {
    this.isLoading = true;

    // Load all data in parallel
    Promise.all([
      this.loadStats(),
      this.loadRoomStatuses(),
      this.loadPendingTasks(),
      this.loadUrgentTasks(),
      this.loadRecentInspections()

    ]).finally(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Ensure view updates after loading
    });
  }

  /**
   * Load dashboard statistics
   */
   loadStats(): Promise<void> {
    return new Promise((resolve) => {
      this.housekeepingService.getDashboardStats().subscribe({
        next: (response:any) => {
         // console.log('Dashboard stats response:', response);
          if (response && response.success) {
            this.stats = response.data;
            this.cdr.detectChanges(); // Ensure view updates with new stats
          } else if (response && !response.success) {
            console.error('Failed to load stats:', response.message);
            this.stats = this.getDefaultStats();
          }
          resolve();
        },
        error: (error) => {
          console.error('Error loading dashboard stats:', error);
this.toastr.error(error.message || 'Failed to load dashboard statistics. Please try again later.', 'Error');
          this.stats = this.getDefaultStats();
          resolve();
        }
      });
    });
  }

  /**
   * Load room statuses
   */
  private loadRoomStatuses(): Promise<void> {
    return new Promise((resolve) => {
      this.housekeepingService.getAllRoomStatuses().subscribe({
        next: (response:any) => {
          if (response && response.success) {
            this.roomStatuses = response.data;
          } else if (response && !response.success) {
            console.error('Failed to load room statuses:', response.message);
            this.roomStatuses = [];
          }
          resolve();
        },
        error: (error) => {
          console.error('Error loading room statuses:', error);
          this.roomStatuses = [];
          resolve();
        }
      });
    });
  }

  /**
   * Load pending tasks
   */
  private loadPendingTasks(): Promise<void> {
    return new Promise((resolve) => {
      this.housekeepingService.getTasks({
        status: 'Pending',
        page: 1,
        pageSize: 5
      }).subscribe({
        next: (response:any) => {
        //  console.log('Pending tasks response:', response);
          if (response.totalCount > 0) {
            this.pendingTasks = response.items;
             this.cdr.detectChanges();
          } else if (response.totalCount === 0) {
           // this.toastr.error('Failed to load pending tasks');
            this.pendingTasks = [];
             this.cdr.detectChanges();
          }
          resolve();
        },
        error: (error) => {
          console.error('Error loading pending tasks:', error);
          this.pendingTasks = [];
          resolve();
        }
      });
    });
  }

  /**
   * Load urgent tasks (high priority)
   */
  private loadUrgentTasks(): Promise<void> {
    return new Promise((resolve) => {
      this.housekeepingService.getTasks({
        priority: 'High',
        status: 'Pending',
        page: 1,
        pageSize: 3
      }).subscribe({
        next: (response:any) => {
          if (response && response.success) {
            this.urgentTasks = response.data || [];
          }
          resolve();
        },
        error: (error) => {
          console.error('Error loading urgent tasks:', error);
          this.urgentTasks = [];
          resolve();
        }
      });
    });
  }

  /**
   * Load recent inspections
   */
  private loadRecentInspections(): Promise<void> {
    return new Promise((resolve) => {
      this.housekeepingService.getRecentInspections(5).subscribe({
        next: (response:any) => {
          if (response && response.success) {
            this.recentInspections = response.data || [];
            this.isLoading = false;
            this.cdr.detectChanges();
          }
          resolve();
        },
        error: (error:any) => {
          console.error('Error loading recent inspection:', error);
          this.recentInspections = [];
          this.isLoading = false;
            this.cdr.detectChanges();
          resolve();
        }
      });
    });
  }

  /**
   * Start auto-refresh interval (every 30 seconds)
   */
  private startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      this.loadStats();
      this.loadRoomStatuses();
    }, 30000);
  }

  /**
   * Start clock update interval
   */
  private startClock(): void {
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  /**
   * Get default stats when API fails
   */
  private getDefaultStats(): DashboardStats {
    return {
      dirtyRooms: 0,
      cleaningInProgress: 0,
      cleanRooms: 0,
      inspectedRooms: 0,
      outOfService: 0,
      availableRooms: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      completedToday: 0,
      averageCleaningTime: 0,
      inspectionPassRate: 0,
      totalRooms: 0
    };
  }

  /**
   * Calculate occupancy rate
   */
  getOccupancyRate(): number {
    console.log('Calculating occupancy rate with stats:', this.stats);
    if (!this.stats || this.stats.totalRooms === 0) return 0;
    const occupied = this.stats.totalRooms - this.stats.availableRooms - this.stats.outOfService;
    return Math.round((occupied / this.stats.totalRooms) * 100);
  }

  /**
   * Calculate cleaning completion rate
   */
  getCleaningCompletionRate(): number {
    if (!this.stats) return 0;
    const totalCleaning = this.stats.dirtyRooms + this.stats.cleaningInProgress + this.stats.cleanRooms;
    if (totalCleaning === 0) return 0;
    const completed = this.stats.cleanRooms + this.stats.inspectedRooms;
    return Math.round((completed / totalCleaning) * 100);
  }

  /**
   * Get CSS class for room status
   */
  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'Dirty': 'status-dirty',
      'Cleaning': 'status-cleaning',
      'Clean': 'status-clean',
      'Inspected': 'status-inspected',
      'Available': 'status-available',
      'OutOfService': 'status-outofservice'
    };
    return statusMap[status] || '';
  }

  /**
   * Get priority class for task
   */
  getPriorityClass(priority: string): string {
    const priorityMap: Record<string, string> = {
      'High': 'priority-high',
      'Normal': 'priority-normal',
      'Low': 'priority-low'
    };
    return priorityMap[priority] || '';
  }

  /**
   * Get status class for task
   */
  getTaskStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'Pending': 'task-pending',
      'InProgress': 'task-progress',
      'Completed': 'task-completed',
      'Failed': 'task-failed',
      'Cancelled': 'task-cancelled'
    };
    return statusMap[status] || '';
  }

  /**
   * Format time ago
   */
  getTimeAgo(date: Date | string): string {
    if (!date) return '';

    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return past.toLocaleDateString();
  }

  /**
   * Get status icon name
   */
  getStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      'Dirty': 'cleaning_services',
      'Cleaning': 'build',
      'Clean': 'check_circle',
      'Inspected': 'verified',
      'Available': 'hotel',
      'OutOfService': 'block'
    };
    return iconMap[status] || 'help';
  }

  /**
   * Get priority icon
   */
  getPriorityIcon(priority: string): string {
    const iconMap: Record<string, string> = {
      'High': 'priority_high',
      'Normal': 'remove',
      'Low': 'low_priority'
    };
    return iconMap[priority] || '';
  }

  /**
   * Manual refresh all data
   */
  refreshAll(): void {
    this.loadDashboardData();
  }

  /**
   * Start a task
   */
  startTask(task: HousekeepingTask): void {
    if (task.status !== 'InProgress') {
      this.housekeepingService.updateTaskStatus(task.taskId, 'InProgress').subscribe({
        next: (response:any) => {
          if (response && response.success) {
            this.loadPendingTasks();
            this.loadUrgentTasks();
          }
        },
        error: (error:any) => {
          console.error('Error starting task:', error);
        }
      });
    }
  }

  /**
   * Get room by ID
   */
  getRoomById(roomId: number): RoomStatus | undefined {
    return this.roomStatuses.find(room => room.roomId === roomId);
  }

  /**
   * Get rooms by status
   */
  getRoomsByStatus(status: string): RoomStatus[] {
    return this.roomStatuses.filter(room => room.status === status);
  }

  /**
   * Get count of rooms by status
   */
  getRoomCountByStatus(status: string): number {
    return this.roomStatuses.filter(room => room.status === status).length;
  }
}
