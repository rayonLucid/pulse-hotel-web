// src/app/modules/rooms/pages/room-status/room-status.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RoomService } from '../../../../core/services/room.service';
import { RoomStatus, RoomStatusType, getRoomStatusLabel, getRoomStatusClass } from '../../../../core/models/room.model';

interface StatusFilter {
  status: string;
  floor: number | null;
  roomType: string;
}

@Component({
  selector: 'app-room-status',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './room-status.component.html',
  styleUrls: ['./room-status.component.scss']
})
export class RoomStatusComponent implements OnInit, OnDestroy {
  roomStatuses: RoomStatus[] = [];
  filteredRooms: RoomStatus[] = [];
  paginatedRooms: RoomStatus[] = [];
  isLoading = true;
  searchTerm = '';
  selectedFloor: number | null = null;
  selectedStatus: string = '';
  selectedRoomType: string = '';
  refreshInterval: any;
  Math = Math;

  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalItems = 0;
  totalPages = 0;

  // Statistics
  stats = {
    total: 0,
    available: 0,
    occupied: 0,
    maintenance: 0,
    cleaning: 0,
    reserved: 0
  };

  // Floor filters
  floors: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Status options
  statusOptions: { value: string; label: string; count: number }[] = [
    { value: '', label: 'All Statuses', count: 0 },
    { value: 'Available', label: 'Available', count: 0 },
    { value: 'Occupied', label: 'Occupied', count: 0 },
    { value: 'Maintenance', label: 'Maintenance', count: 0 },
    { value: 'Cleaning', label: 'Cleaning', count: 0 },
    { value: 'Reserved', label: 'Reserved', count: 0 }
  ];

  // View mode
  viewMode: 'grid' | 'floor' = 'grid';

  // Floor plan data
  floorPlan: { [key: number]: RoomStatus[] } = {};
private changeDet = inject(ChangeDetectorRef);
  constructor(
    private roomService: RoomService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadRoomStatuses();

    // Auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadRoomStatuses();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadRoomStatuses(): void {
    this.isLoading = true;
    this.roomService.getRoomStatuses().subscribe({
      next: (response) => {
        if (response.success) {
          this.roomStatuses = response.data;
          this.updateStatistics();
          this.buildFloorPlan();
          this.applyFilters();
          this.isLoading = false;
        } else {
          this.toastr.error('Failed to load room statuses', 'Error');
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading room statuses:', error);
      //  this.toastr.error('Failed to load room statuses', 'Error');
        this.isLoading = false;
          this.changeDet.detectChanges();
  const match = error.error.error.match(/'([^']+)'/);
          this.toastr.error( (match ? match[1] : 'Failed to load bookings') || error.error.message , 'Error');
      }
    });
  }

  updateStatistics(): void {
    this.stats.total = this.roomStatuses.length;
    this.stats.available = this.roomStatuses.filter(r => r.status === 'Available').length;
    this.stats.occupied = this.roomStatuses.filter(r => r.status === 'Occupied').length;
    this.stats.maintenance = this.roomStatuses.filter(r => r.status === 'Maintenance').length;
    this.stats.cleaning = this.roomStatuses.filter(r => r.status === 'Cleaning').length;
    this.stats.reserved = this.roomStatuses.filter(r => r.status === 'Reserved').length;

    // Update status options with counts
    this.statusOptions[0].count = this.stats.total;
    this.statusOptions[1].count = this.stats.available;
    this.statusOptions[2].count = this.stats.occupied;
    this.statusOptions[3].count = this.stats.maintenance;
    this.statusOptions[4].count = this.stats.cleaning;
    this.statusOptions[5].count = this.stats.reserved;
  }

  buildFloorPlan(): void {
    this.floorPlan = {};
    this.floors.forEach(floor => {
      this.floorPlan[floor] = this.roomStatuses.filter(room => room.floorNumber === floor);
    });
  }

  applyFilters(): void {
    let filtered = [...this.roomStatuses];

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(room =>
        room.roomNumber.toLowerCase().includes(term) ||
        room.roomType.toLowerCase().includes(term) ||
        (room.currentGuestName && room.currentGuestName.toLowerCase().includes(term))
      );
    }

    // Filter by status
    if (this.selectedStatus) {
      filtered = filtered.filter(room => room.status === this.selectedStatus);
    }

    // Filter by floor
    if (this.selectedFloor) {
      filtered = filtered.filter(room => room.floorNumber === Number(this.selectedFloor));
    }

    this.filteredRooms = filtered;
    this.totalItems = this.filteredRooms.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedRooms();
  }

  updatePaginatedRooms(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedRooms = this.filteredRooms.slice(start, end);
    this.isLoading = false;
    this.changeDet.detectChanges();
   // console.log('Paginated rooms:', this.paginatedRooms);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedRooms();
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

  onSearch(): void {
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedStatus || this.selectedFloor);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedFloor = null;
    this.applyFilters();
  }

  setViewMode(mode: 'grid' | 'floor'): void {
    this.viewMode = mode;
  }

  getStatusClass(status: string): string {
    return getRoomStatusClass(status as RoomStatusType);
  }

  getStatusLabel(status: string): string {
    return getRoomStatusLabel(status as RoomStatusType);
  }

  getOccupancyRate(): number {
    if (this.stats.total === 0) return 0;
    return Math.round((this.stats.occupied / this.stats.total) * 100);
  }

  getFloorOccupancyRate(floor: number): number {
    const roomsOnFloor = this.floorPlan[floor] || [];
    if (roomsOnFloor.length === 0) return 0;
    const occupiedCount = roomsOnFloor.filter(r => r.status === 'Occupied').length;
    return Math.round((occupiedCount / roomsOnFloor.length) * 100);
  }

  getRoomStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Available': '#10b981',
      'Occupied': '#3b82f6',
      'Maintenance': '#ef4444',
      'Cleaning': '#f59e0b',
      'Reserved': '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  }

  getRoomIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'Available': 'fa-bed',
      'Occupied': 'fa-user-check',
      'Maintenance': 'fa-tools',
      'Cleaning': 'fa-broom',
      'Reserved': 'fa-clock'
    };
    return icons[status] || 'fa-bed';
  }

  refresh(): void {
    this.loadRoomStatuses();
    this.toastr.info('Refreshing room statuses...', 'Refresh');
  }

  viewRoomDetail(roomId: number): void {
    // Navigate to room detail
    // this.router.navigate(['/rooms/detail', roomId]);
  }
}
