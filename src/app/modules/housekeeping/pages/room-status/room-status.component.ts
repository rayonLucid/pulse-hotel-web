// src/app/modules/housekeeping/pages/room-status/room-status.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HousekeepingService } from '../../../../core/services/housekeeping.service';
import { RoomStatus } from '../../../../core/models/housekeeping.model';

@Component({
  selector: 'app-room-status',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './room-status.component.html',
  styleUrls: ['./room-status.component.scss']
})
export class RoomStatusComponent implements OnInit, OnDestroy {
  // Data
  rooms: RoomStatus[] = [];
  filteredRooms: RoomStatus[] = [];
  selectedRoom: RoomStatus | null = null;

  // UI State
  isLoading = false;
  isSubmitting = false;
  viewMode: 'grid' | 'list' = 'grid';

  // Filters
  selectedFloor: string = 'all';
  selectedStatus: string = 'all';
  searchTerm: string = '';

  // Available floors (populated from API data)
  availableFloors: number[] = [];

  // Modal visibility
  showUpdateModal = false;
  showDetailsModal = false;

  // Update form data
  updateData = {
    status: '',
    notes: ''
  };

  // Error states
  errorMessage: string = '';

  private refreshInterval: any;

  constructor(private housekeepingService: HousekeepingService) {}

  ngOnInit(): void {
    this.loadRooms();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // ==================== DATA LOADING ====================

  /**
   * Load all rooms from API
   */
  loadRooms(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.housekeepingService.getAllRoomStatuses().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.rooms = response.data;
          this.extractAvailableFloors();
          this.applyFilters();
        } else {
          this.errorMessage = response.message || 'Failed to load room statuses';
          this.rooms = [];
          this.filteredRooms = [];
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading rooms:', error);
        this.errorMessage = typeof error === 'string' ? error : 'Failed to load room statuses. Please try again.';
        this.rooms = [];
        this.filteredRooms = [];
        this.isLoading = false;
      }
    });
  }

  /**
   * Extract unique floor numbers from rooms data
   */
  private extractAvailableFloors(): void {
    const floors = new Set<number>();
    this.rooms.forEach(room => {
      if (room.floorNumber) {
        floors.add(room.floorNumber);
      }
    });
    this.availableFloors = Array.from(floors).sort((a, b) => a - b);
  }

  /**
   * Apply all filters to rooms
   */
  applyFilters(): void {
    let filtered = [...this.rooms];

    // Filter by floor
    if (this.selectedFloor !== 'all') {
      const floorNum = parseInt(this.selectedFloor);
      filtered = filtered.filter(room => room.floorNumber === floorNum);
    }

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(room => room.status === this.selectedStatus);
    }

    // Filter by search term (room number)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(room =>
        room.roomNumber.toLowerCase().includes(term) ||
        room.roomType.toLowerCase().includes(term)
      );
    }

    this.filteredRooms = filtered;
  }

  // ==================== AUTO REFRESH ====================

  private startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      if (!this.showUpdateModal && !this.showDetailsModal) {
        this.loadRooms();
      }
    }, 30000);
  }

  // ==================== FILTERS ====================

  onFilterChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.selectedFloor = 'all';
    this.selectedStatus = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  // ==================== ROOM ACTIONS ====================

  /**
   * Open update status modal
   */
  openUpdateModal(room: RoomStatus): void {
    this.selectedRoom = room;
    this.updateData = {
      status: room.status,
      notes: ''
    };
    this.showUpdateModal = true;
  }

  /**
   * Update room status
   */
  updateRoomStatus(): void {
    if (!this.selectedRoom) return;

    this.isSubmitting = true;

    this.housekeepingService.updateRoomStatus(
      this.selectedRoom.roomId,
      this.updateData.status,
      this.updateData.notes
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.showUpdateModal = false;
          this.loadRooms();
        } else {
          alert(response.message || 'Failed to update room status');
        }
        this.isSubmitting = false;
      },
      error: (error: any) => {
        console.error('Error updating room status:', error);
        alert(typeof error === 'string' ? error : 'Failed to update room status. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Quick status update (without modal)
   */
  quickStatusUpdate(room: RoomStatus, newStatus: string): void {
    this.housekeepingService.updateRoomStatus(room.roomId, newStatus, '').subscribe({
      next: (response: any) => {
        if (response.success) {
          this.loadRooms();
        } else {
          alert(response.message || 'Failed to update room status');
        }
      },
      error: (error: any) => {
        console.error('Error updating room status:', error);
        alert('Failed to update room status. Please try again.');
      }
    });
  }

  /**
   * View room details
   */
  viewRoomDetails(room: RoomStatus): void {
    // Load fresh room details from API
    this.housekeepingService.getRoomById(room.roomId).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.selectedRoom = response.data;
          this.showDetailsModal = true;
        } else {
          alert('Failed to load room details');
        }
      },
      error: (error: any) => {
        console.error('Error loading room details:', error);
        alert('Failed to load room details. Please try again.');
      }
    });
  }

  // ==================== HELPER METHODS ====================

  /**
   * Get CSS class for room status badge
   */
  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'Dirty': 'status-dirty',
      'Cleaning': 'status-cleaning',
      'Clean': 'status-clean',
      'Inspected': 'status-inspected',
      'Available': 'status-available',
      'OutOfService': 'status-outofservice'
    };
    return classes[status] || '';
  }

  /**
   * Get status icon
   */
  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'Dirty': '🧹',
      'Cleaning': '🔧',
      'Clean': '✓',
      'Inspected': '✓✓',
      'Available': '🏨',
      'OutOfService': '🚫'
    };
    return icons[status] || '❓';
  }

  /**
   * Get status display name
   */
  getStatusDisplayName(status: string): string {
    const names: Record<string, string> = {
      'Dirty': 'Dirty',
      'Cleaning': 'Cleaning',
      'Clean': 'Clean',
      'Inspected': 'Inspected',
      'Available': 'Available',
      'OutOfService': 'Out of Service'
    };
    return names[status] || status;
  }

  /**
   * Get available status options for update
   */
  getAvailableStatuses(currentStatus: string): string[] {
    const allStatuses = ['Dirty', 'Cleaning', 'Clean', 'Inspected', 'Available', 'OutOfService'];
    // Return all statuses except current one
    return allStatuses.filter(s => s !== currentStatus);
  }

  /**
   * Format date safely
   */
  formatDate(date: Date | string | undefined | null): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  }

  /**
   * Format time only
   */
  formatTime(date: Date | string | undefined | null): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleTimeString();
    } catch {
      return 'Invalid Time';
    }
  }

  /**
   * Get estimated completion time display
   */
  getEstimatedCompletionDisplay(room: RoomStatus): string {
    if (!room.estimatedCompletion) return 'Not set';

    const now = new Date();
    const estimated = new Date(room.estimatedCompletion);
    const diffMinutes = Math.round((estimated.getTime() - now.getTime()) / 60000);

    if (diffMinutes < 0) return 'Overdue';
    if (diffMinutes < 60) return `${diffMinutes} minutes`;
    if (diffMinutes < 120) return '1 hour';
    return `${Math.round(diffMinutes / 60)} hours`;
  }

  /**
   * Get cleanliness level (if available from room data)
   */
  getCleanlinessLevel(room: RoomStatus): number {
    // If you have cleanliness score in your model, use it
    // For now, derive from status
    switch(room.status) {
      case 'Clean': return 100;
      case 'Inspected': return 100;
      case 'Available': return 95;
      case 'Cleaning': return 50;
      case 'Dirty': return 20;
      case 'OutOfService': return 0;
      default: return 50;
    }
  }

  /**
   * Get cleanliness color
   */
  getCleanlinessColor(level: number): string {
    if (level >= 80) return '#4caf50';
    if (level >= 50) return '#ff9800';
    return '#f44336';
  }

  /**
   * Get room count by status
   */
  getRoomCountByStatus(status: string): number {
    return this.rooms.filter(room => room.status === status).length;
  }

  /**
   * Get total rooms count
   */
  getTotalRooms(): number {
    return this.rooms.length;
  }

  /**
   * Get occupied rooms count (rooms that are not available or dirty)
   */
  getOccupiedRoomsCount(): number {
    return this.rooms.filter(room =>
      room.status !== 'Available' &&
      room.status !== 'Clean' &&
      room.status !== 'Inspected'
    ).length;
  }

  /**
   * Get available rooms count
   */
  getAvailableRoomsCount(): number {
    return this.rooms.filter(room => room.status === 'Available').length;
  }

  /**
   * Get cleaning progress percentage
   */
  getCleaningProgress(): number {
    const total = this.rooms.length;
    if (total === 0) return 0;
    const cleanAndInspected = this.rooms.filter(room =>
      room.status === 'Clean' || room.status === 'Inspected'
    ).length;
    return Math.round((cleanAndInspected / total) * 100);
  }

  /**
   * Dismiss error message
   */
  dismissError(): void {
    this.errorMessage = '';
  }

  /**
   * Manual refresh
   */
  refreshData(): void {
    this.loadRooms();
  }
}
