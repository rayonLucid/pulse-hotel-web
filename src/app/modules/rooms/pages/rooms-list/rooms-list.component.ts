// src/app/modules/rooms/pages/rooms-list/rooms-list.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../../../core/services/room.service';
import { Room, RoomStatusType, getRoomStatusClass, formatPrice } from '../../../../core/models/room.model';

@Component({
  selector: 'app-rooms-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './rooms-list.component.html',
  styleUrls: ['./rooms-list.component.scss']
})
export class RoomsListComponent implements OnInit {
  rooms: Room[] = [];
  isLoading = true;

  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalItems = 0;
  totalPages = 0;
  Math = Math;

  // Filters
  filters = {
    status:  '' ,
    floor: null as number | null,
    roomType: ''
  };

  // Options
  floors: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  roomTypes: string[] = ['Deluxe', 'Executive', 'Presidential', 'Lagoon View', 'Standard'];

  stats = {
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    maintenanceRooms: 0
  };
private changeDet = inject(ChangeDetectorRef);
  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.loadRooms();
    this.loadStats();
  }

  loadRooms(): void {
    this.isLoading = true;

    this.roomService.getRooms({
      page: this.currentPage,
      pageSize: this.pageSize,
      status: (this.filters.status === '' ? undefined : this.filters.status) as RoomStatusType,
      floor: this.filters.floor || undefined,
      roomType: this.filters.roomType || undefined
    }).subscribe({
      next: (response) => {
        this.rooms = response.data;
        this.totalItems = response.pagination.totalItems;
        this.totalPages = response.pagination.totalPages;
        this.isLoading = false;
        this.changeDet.detectChanges();
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.isLoading = false;
        this.changeDet.detectChanges();

      }
    });
  }

  loadStats(): void {
    this.roomService.getRoomStatistics().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
          this.changeDet.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.changeDet.detectChanges();
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadRooms();
  }

  clearFilters(): void {
    this.filters = {
      status: '',
      floor: null,
      roomType: ''
    };
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.status || this.filters.floor || this.filters.roomType);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadRooms();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage: number;
    let endPage: number;

    if (this.totalPages <= maxVisible) {
      startPage = 1;
      endPage = this.totalPages;
    } else {
      if (this.currentPage <= Math.ceil(maxVisible / 2)) {
        startPage = 1;
        endPage = maxVisible;
      } else if (this.currentPage + Math.floor(maxVisible / 2) >= this.totalPages) {
        startPage = this.totalPages - maxVisible + 1;
        endPage = this.totalPages;
      } else {
        startPage = this.currentPage - Math.floor(maxVisible / 2);
        endPage = this.currentPage + Math.floor(maxVisible / 2);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getStatusClass(status: string): string {
    return getRoomStatusClass(status as RoomStatusType);
  }

  formatPrice(price: number): string {
    return formatPrice(price);
  }
}
