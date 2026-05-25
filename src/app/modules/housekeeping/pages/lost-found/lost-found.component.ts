// src/app/modules/housekeeping/pages/lost-found/lost-found.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HousekeepingService } from '../../../../core/services/housekeeping.service';
import { LostAndFoundItem, RoomStatus } from '../../../../core/models/housekeeping.model';

@Component({
  selector: 'app-lost-found',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lost-found.component.html',
  styleUrls: ['./lost-found.component.scss']
})
export class LostFoundComponent implements OnInit, OnDestroy {
  // Data
  items: LostAndFoundItem[] = [];
  filteredItems: LostAndFoundItem[] = [];
  selectedItem: LostAndFoundItem | null = null;
  relatedRoom: RoomStatus | null = null;

  // UI State
  isLoading = false;
  isSubmitting = false;
  viewMode: 'list' | 'grid' = 'list';

  // Filters
  selectedStatus: string = 'all';
  selectedCategory: string = 'all';
  searchTerm: string = '';
  startDate: string = '';
  endDate: string = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Statistics
  statistics: any = null;

  // Modal visibility
  showCreateModal = false;
  showDetailsModal = false;
  showClaimModal = false;

  // Form data for new item
  newItem: any = {
    itemName: '',
    itemDescription: '',
    category: '',
    roomId: null,
    roomNumber: '',
    foundBy: null,
    foundByName: '',
    location: '',
    photoUrl: ''
  };

  // Claim data
  claimData = {
    claimedBy: null,
    claimedByName: ''
  };

  // Available categories
  categories: string[] = ['Electronics', 'Jewelry', 'Clothing', 'Documents', 'Luggage', 'Keys', 'Wallet', 'Other'];

  // Available rooms for dropdown
  availableRooms: RoomStatus[] = [];

  // Error states
  errorMessage: string = '';

  private refreshInterval: any;

  constructor(private housekeepingService: HousekeepingService) {}

  ngOnInit(): void {
    this.loadItems();
    this.loadStatistics();
    this.loadAvailableRooms();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // ==================== DATA LOADING ====================

  /**
   * Load lost and found items from API
   */
  loadItems(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const status = this.selectedStatus !== 'all' ? this.selectedStatus : undefined;
    const category = this.selectedCategory !== 'all' ? this.selectedCategory : undefined;

    this.housekeepingService.getLostAndFoundItems(status, category).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.items = response.data;
          this.totalItems = response.totalCount || response.data.length;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.applyFilters();
          this.updateStatistics();
        } else {
          this.errorMessage = response.message || 'Failed to load lost and found items';
          this.items = [];
          this.filteredItems = [];
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading lost and found items:', error);
        this.errorMessage = typeof error === 'string' ? error : 'Failed to load items. Please try again.';
        this.items = [];
        this.filteredItems = [];
        this.isLoading = false;
      }
    });
  }

  /**
   * Update statistics
   */
  updateStatistics(): void {
    this.statistics = {
      total: this.items.length,
      pending: this.items.filter(i => i.status === 'Pending').length,
      claimed: this.items.filter(i => i.status === 'Claimed').length,
      donated: this.items.filter(i => i.status === 'Donated').length,
      disposed: this.items.filter(i => i.status === 'Disposed').length,
      byCategory: this.getCategoryBreakdown()
    };
  }

  /**
   * Get category breakdown
   */
  getCategoryBreakdown(): any {
    const breakdown: any = {};
    this.categories.forEach(cat => {
      breakdown[cat] = this.items.filter(i => i.category === cat).length;
    });
    return breakdown;
  }

  /**
   * Load statistics
   */
  loadStatistics(): void {
    this.housekeepingService.getDashboardStats().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          console.log('Dashboard stats loaded:', response.data);
        }
      },
      error: (error: any) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  /**
   * Load available rooms for dropdown
   */
  loadAvailableRooms(): void {
    this.housekeepingService.getAllRoomStatuses().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.availableRooms = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading rooms:', error);
      }
    });
  }

  /**
   * Apply filters
   */
  applyFilters(): void {
    let filtered = [...this.items];

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(i => i.status === this.selectedStatus);
    }

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(i => i.category === this.selectedCategory);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(i =>
        i.itemName.toLowerCase().includes(term) ||
        i.itemDescription.toLowerCase().includes(term) ||
        i.location.toLowerCase().includes(term) ||
        (i.roomNumber && i.roomNumber.includes(term))
      );
    }

    // Filter by date range
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59);

      filtered = filtered.filter(i => {
        const date = new Date(i.foundDate);
        return date >= start && date <= end;
      });
    }

    this.filteredItems = filtered;
  }

  // ==================== AUTO REFRESH ====================

  private startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      if (!this.showCreateModal && !this.showDetailsModal && !this.showClaimModal) {
        this.loadItems();
      }
    }, 60000);
  }

  // ==================== FILTERS ====================

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadItems();
  }

  resetFilters(): void {
    this.selectedStatus = 'all';
    this.selectedCategory = 'all';
    this.searchTerm = '';
    this.startDate = '';
    this.endDate = '';
    this.loadItems();
  }

  clearDateRange(): void {
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  // ==================== PAGINATION ====================

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadItems();
    }
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadItems();
  }

  // ==================== ITEM CRUD OPERATIONS ====================

  /**
   * Open create item modal
   */
  openCreateModal(): void {
    this.newItem = {
      itemName: '',
      itemDescription: '',
      category: '',
      roomId: null,
      roomNumber: '',
      foundBy: null,
      foundByName: '',
      location: '',
      photoUrl: ''
    };
    this.showCreateModal = true;
  }

  /**
   * Create new lost and found item
   */
  createItem(): void {
    if (!this.newItem.itemName || !this.newItem.category || !this.newItem.foundByName) {
      alert('Please fill in all required fields');
      return;
    }

    this.isSubmitting = true;

    const itemData = {
      ...this.newItem,
      foundDate: new Date(),
      status: 'Pending',
      isClaimed: false
    };

    this.housekeepingService.createLostAndFoundItem(itemData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.showCreateModal = false;
          this.loadItems();
          alert('Item reported successfully');
        } else {
          alert(response.message || 'Failed to create item');
        }
        this.isSubmitting = false;
      },
      error: (error: any) => {
        console.error('Error creating item:', error);
        alert(typeof error === 'string' ? error : 'Failed to create item. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  /**
   * View item details
   */
  viewItemDetails(item: LostAndFoundItem): void {
    this.selectedItem = item;

    // Load related room info if room exists
    if (item.roomId) {
      this.housekeepingService.getRoomById(item.roomId).subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            this.relatedRoom = response.data;
          }
        },
        error: (error: any) => {
          console.error('Error loading related room:', error);
        }
      });
    }

    this.showDetailsModal = true;
  }

  /**
   * Open claim modal
   */
  openClaimModal(item: LostAndFoundItem): void {
    this.selectedItem = item;
    this.claimData = {
      claimedBy: null,
      claimedByName: ''
    };
    this.showClaimModal = true;
  }

  /**
   * Claim item
   */
  claimItem(): void {
    if (!this.selectedItem || !this.claimData.claimedBy || !this.claimData.claimedByName) {
      alert('Please enter claimant information');
      return;
    }

    this.isSubmitting = true;

    this.housekeepingService.claimLostAndFoundItem(
      this.selectedItem.itemId,
      this.claimData.claimedBy,
      this.claimData.claimedByName
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.showClaimModal = false;
          this.loadItems();
          alert('Item claimed successfully');
        } else {
          alert(response.message || 'Failed to claim item');
        }
        this.isSubmitting = false;
      },
      error: (error: any) => {
        console.error('Error claiming item:', error);
        alert(typeof error === 'string' ? error : 'Failed to claim item. Please try again.');
        this.isSubmitting = false;
      }
    });
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
   * Format date only
   */
  formatDateOnly(date: Date | string | undefined | null): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'Pending': 'status-pending',
      'Claimed': 'status-claimed',
      'Donated': 'status-donated',
      'Disposed': 'status-disposed'
    };
    return classes[status] || '';
  }

  /**
   * Get status icon
   */
  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'Pending': '⏰',
      'Claimed': '✓',
      'Donated': '🎁',
      'Disposed': '🗑️'
    };
    return icons[status] || '❓';
  }

  /**
   * Get room status display
   */
  getRoomStatusDisplay(status: string): string {
    const statuses: Record<string, string> = {
      'Dirty': 'Dirty',
      'Cleaning': 'Cleaning',
      'Clean': 'Clean',
      'Inspected': 'Inspected',
      'Available': 'Available',
      'OutOfService': 'Out of Service'
    };
    return statuses[status] || status;
  }

  /**
   * Get room status class
   */
  getRoomStatusClass(status: string): string {
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
   * Dismiss error message
   */
  dismissError(): void {
    this.errorMessage = '';
  }

  /**
   * Manual refresh
   */
  refreshData(): void {
    this.loadItems();
  }

  /**
   * Get paginated items
   */
  getPaginatedItems(): LostAndFoundItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredItems.slice(start, end);
  }
}
