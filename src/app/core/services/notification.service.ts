// src/app/core/services/notification.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { Notification, StaffNotification, NotificationStats } from '../models/notification.model';
import { AppConfigService } from './app.config.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
 // private apiUrl = `${environment.apiUrl}/notifications`;

  // Real-time notification stream
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();
 private rootUrl = "";
  public apiUrl = '';
    constructor(private readonly config:AppConfigService) {

  this.apiUrl = `${this.config.apiUrl}/notifications`;
   // console.log('NotificationService initialized with API URL:', this.apiUrl);
  this.rootUrl = this.config.rootUrl;
  this.loadInitialNotifications();
    }


  private loadInitialNotifications(): void {
    this.getNotifications().subscribe({
      next: (notifications) => {
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount(notifications);
      }
    });
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<{ success: boolean; data: Notification[] }>(`${this.apiUrl}/guest`)
      .pipe(map(response => response.data));
  }

  getStaffNotifications(): Observable<StaffNotification[]> {
    return this.http.get<{ success: boolean; data: StaffNotification[] }>(`${this.apiUrl}/staff`)
      .pipe(map(response => response.data));
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/mark-all-read`, {});
  }

  getNotificationStats(): Observable<NotificationStats> {
    return this.http.get<{ success: boolean; data: NotificationStats }>(`${this.apiUrl}/stats`)
      .pipe(map(response => response.data));
  }

  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${notificationId}`);
  }

  // WebSocket/SignalR for real-time notifications
  // You'll need to set up SignalR for real-time updates
  addRealTimeNotification(notification: Notification): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...current]);
    this.updateUnreadCount([notification, ...current]);
  }

  private updateUnreadCount(notifications: Notification[]): void {
    const unread = notifications.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unread);
  }
}
