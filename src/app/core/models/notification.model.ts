// src/app/core/models/notification.model.ts
export interface Notification {
  id: number;
  bookingId?: number;
  guestId?: number;
  title: string;
  message: string;
  type: 'CheckoutReminder' | 'OverdueCheckout' | 'PaymentSuccess' | 'BookingConfirmed';
  severity: 'Normal' | 'High' | 'Critical';
  createdAt: Date;
  isRead: boolean;
}

export interface StaffNotification {
  id: number;
  title: string;
  message: string;
  priority: 'Normal' | 'High' | 'Critical';
  department: string;
  createdAt: Date;
  isRead: boolean;
}

export interface NotificationStats {
  unreadCount: number;
  highPriorityCount: number;
  todayCount: number;
}
