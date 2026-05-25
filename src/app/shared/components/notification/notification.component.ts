// src/app/shared/components/notification/notification.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification, StaffNotification } from '../../../core/models/notification.model';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, User } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  staffNotifications: StaffNotification[] = [];
  unreadCount = 0;
  showDropdown = false;
  activeTab: 'guest' | 'staff' = 'guest';
  isLoading = false;

  private destroy$ = new Subject<void>();
user!: User | null;
  constructor(private notificationService: NotificationService, private authService: AuthService) {}

  ngOnInit(): void {
     this.user = this.authService.getCurrentUser();
    this.loadNotifications();
    this.subscribeToUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadNotifications(): void {
    this.isLoading = true;

    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.isLoading = false;
      }
    });

    // Load staff notifications if user is staff
    this.notificationService.getStaffNotifications().subscribe({
      next: (notifications) => {
        this.staffNotifications = notifications;
      }
    });
  }

  private subscribeToUpdates(): void {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });

    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.markCurrentAsRead();
    }
  }

  markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();

    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.unreadCount = 0;
      }
    });
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();

    if (confirm('Delete this notification?')) {
      this.notificationService.deleteNotification(notification.id).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
          if (!notification.isRead) {
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
        }
      });
    }
  }

  markCurrentAsRead(): void {
    const unreadInView = this.notifications.filter(n => !n.isRead);
    if (unreadInView.length > 0) {
      this.notificationService.markAllAsRead().subscribe();
    }
  }

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'Critical': return 'severity-critical';
      case 'High': return 'severity-high';
      default: return 'severity-normal';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'CheckoutReminder': return 'fas fa-bell';
      case 'OverdueCheckout': return 'fas fa-exclamation-triangle';
      case 'PaymentSuccess': return 'fas fa-check-circle';
      case 'BookingConfirmed': return 'fas fa-calendar-check';
      default: return 'fas fa-bell';
    }
  }

  formatTime(date: Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return notificationDate.toLocaleDateString();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-container')) {
      this.showDropdown = false;
    }
  }
}
