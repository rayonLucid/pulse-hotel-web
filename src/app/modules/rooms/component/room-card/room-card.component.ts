// Using the Room model in a component
import { Component, Input, OnInit } from '@angular/core';
import { Room, getRoomStatusClass, formatPrice } from '../../../../core/models/room.model';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="room-card">
      <div class="room-header">
        <h3>Room {{ room.roomNumber }}</h3>
        <span class="status-badge" [class]="getStatusClass()">
          {{ room.status }}
        </span>
      </div>
      <div class="room-price">{{ formatPrice(room.pricePerNight) }}/night</div>
      <div class="room-amenities">
        <span *ngFor="let amenity of room.amenities.slice(0, 3)">
          {{ amenity }}
        </span>
      </div>
    </div>
  `
})
export class RoomCardComponent {
  @Input() room!: Room;

  getStatusClass(): string {
    return getRoomStatusClass(this.room.status);
  }

  formatPrice(price: number): string {
    return formatPrice(price);
  }
}
