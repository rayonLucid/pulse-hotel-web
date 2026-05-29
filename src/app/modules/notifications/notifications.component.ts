// src/app/modules/notifications/notifications.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/notification.model';
import { NotificationComponent } from '../../shared/components/notification/notification.component';
import { AuthService, User } from '../../core/auth/auth.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule,NotificationComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  isLoading = false;
  filter: 'all' | 'unread' | 'read' = 'all';
cdr = inject(ChangeDetectorRef)
user :User | null = null;
  constructor(private notificationService: NotificationService,private authService: AuthService) {}

  ngOnInit(): void {
     this.user = this.authService.getCurrentUser();
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredNotifications(): Notification[] {
    if (this.filter === 'unread') {
      return this.notifications.filter(n => !n.isRead);
    }
    if (this.filter === 'read') {
      return this.notifications.filter(n => n.isRead);
    }
    return this.notifications;
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
        }
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
      }
    });
  }

  deleteNotification(notificationId: number): void {
    if (confirm('Delete this notification?')) {
      this.notificationService.deleteNotification(notificationId).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notificationId);
        }
      });
    }
  }
}
