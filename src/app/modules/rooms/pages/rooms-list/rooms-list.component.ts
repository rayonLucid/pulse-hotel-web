// src/app/modules/rooms/pages/rooms-list/rooms-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoomService } from '../../../../core/services/room.service';
import { Room } from '../../../../core/models/room.model';


@Component({
  selector: 'app-rooms-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="rooms-container">
      <div class="page-header">
        <h1 class="page-title">Rooms Management</h1>
        <p class="page-subtitle">Manage all hotel rooms and their status</p>
        <button class="btn-primary" routerLink="/rooms/types">
          <i class="fas fa-tags"></i>
          Manage Room Types
        </button>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon bg-blue-100">
            <i class="fas fa-bed text-blue-600"></i>
          </div>
          <div class="stat-info">
            <h3>Total Rooms</h3>
            <p>{{ stats.totalRooms || 0 }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-green-100">
            <i class="fas fa-check-circle text-green-600"></i>
          </div>
          <div class="stat-info">
            <h3>Available</h3>
            <p>{{ stats.availableRooms || 0 }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-purple-100">
            <i class="fas fa-user-check text-purple-600"></i>
          </div>
          <div class="stat-info">
            <h3>Occupied</h3>
            <p>{{ stats.occupiedRooms || 0 }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-orange-100">
            <i class="fas fa-tools text-orange-600"></i>
          </div>
          <div class="stat-info">
            <h3>Maintenance</h3>
            <p>{{ stats.maintenanceRooms || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="rooms-grid">
        @for (room of rooms; track room.roomId) {
          <div class="room-card">
            <div class="room-header">
              <div>
                <h3 class="room-number">Room {{ room.roomNumber }}</h3>
                <p class="room-type">{{ room.roomType }}</p>
              </div>
              <div class="room-status" [class]="getStatusClass(room.status)">
                {{ room.status }}
              </div>
            </div>
            <div class="room-details">
              <div class="detail">
                <i class="fas fa-dollar-sign"></i>
                <span>{{ formatPrice(room.pricePerNight) }}/night</span>
              </div>
              <div class="detail">
                <i class="fas fa-users"></i>
                <span>Max {{ room.maxAdults }} adults</span>
              </div>
              <div class="detail">
                <i class="fas fa-arrows-alt"></i>
                <span>{{ room.roomSize }} m²</span>
              </div>
            </div>
            <div class="room-footer">
              <a [routerLink]="['/rooms/detail', room.roomId]" class="btn-view">View Details</a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .rooms-container {
      padding: 24px;
      background: #f5f7fa;
      min-height: 100vh;
    }
    .page-header {
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .page-title {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .page-subtitle {
      font-size: 14px;
      color: #6b7280;
    }
    .btn-primary {
      padding: 10px 20px;
      background: #c49a6c;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-icon i { font-size: 24px; }
    .bg-blue-100 { background: #dbeafe; }
    .bg-green-100 { background: #d1fae5; }
    .bg-purple-100 { background: #f3e8ff; }
    .bg-orange-100 { background: #ffedd5; }
    .text-blue-600 { color: #2563eb; }
    .text-green-600 { color: #10b981; }
    .text-purple-600 { color: #9333ea; }
    .text-orange-600 { color: #ea580c; }
    .stat-info h3 { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
    .stat-info p { font-size: 24px; font-weight: 700; color: #1f2937; }
    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }
    .room-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    .room-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    .room-header {
      padding: 16px 20px;
      background: #f9fafb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f0f0f0;
    }
    .room-number { font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 4px; }
    .room-type { font-size: 13px; color: #6b7280; }
    .room-status {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-Available { background: #d1fae5; color: #059669; }
    .status-Occupied { background: #dbeafe; color: #2563eb; }
    .status-Maintenance { background: #fee2e2; color: #dc2626; }
    .status-Cleaning { background: #fef3c7; color: #d97706; }
    .status-Reserved { background: #e5e7eb; color: #4b5563; }
    .room-details { padding: 16px 20px; display: flex; gap: 16px; flex-wrap: wrap; border-bottom: 1px solid #f0f0f0; }
    .detail { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #6b7280; }
    .room-footer { padding: 12px 20px; text-align: right; }
    .btn-view {
      padding: 6px 16px;
      background: #f3f4f6;
      border-radius: 6px;
      text-decoration: none;
      font-size: 13px;
      color: #4b5563;
    }
    @media (max-width: 768px) {
      .rooms-container { padding: 16px; }
      .rooms-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class RoomsListComponent implements OnInit {
  rooms: Room[] = [];
  stats = {
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    maintenanceRooms: 0
  };

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.loadRooms();
    this.loadStats();
  }

  loadRooms(): void {
    this.roomService.getRooms({ page: 1, pageSize: 50 }).subscribe({
      next: (response) => {
        this.rooms = response.data;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
      }
    });
  }

  loadStats(): void {
    this.roomService.getRoomStatistics().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  formatPrice(price: number): string {
    return `₦${price.toLocaleString()}`;
  }
}
