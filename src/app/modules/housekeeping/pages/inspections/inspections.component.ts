// src/app/modules/housekeeping/pages/inspections/inspections.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HousekeepingService } from '../../../../core/services/housekeeping.service';
import { InspectionReport, HousekeepingTask, RoomStatus } from '../../../../core/models/housekeeping.model';

@Component({
  selector: 'app-inspections',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inspections.component.html',
  styleUrls: ['./inspections.component.scss']
})
export class InspectionsComponent implements OnInit, OnDestroy {
  // Data
  inspections: InspectionReport[] = [];
  filteredInspections: InspectionReport[] = [];
  selectedInspection: InspectionReport | null = null;
  relatedTask: HousekeepingTask | null = null;
  relatedRoom: RoomStatus | null = null;

  // UI State
  isLoading = false;
  isSubmitting = false;
  viewMode: 'list' | 'grid' = 'list';

  // Filters
  selectedResult: string = 'all';
  selectedDateRange: string = 'all';
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

  // Form data for new inspection
  newInspection: any = {
    taskId: null,
    roomId: null,
    roomNumber: '',
    inspectedBy: null,
    inspectorName: '',
    isPassed: true,
    score: 100,
    comments: '',
    recleanRequired: false
  };

  // Available tasks for dropdown
  availableTasks: HousekeepingTask[] = [];

  // Error states
  errorMessage: string = '';

  private refreshInterval: any;

  constructor(private housekeepingService: HousekeepingService) {}

  ngOnInit(): void {
    this.loadInspections();
    this.loadStatistics();
    this.loadAvailableTasks();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // ==================== DATA LOADING ====================

  /**
   * Load all inspections from API - Using getInspections method
   */
  loadInspections(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Use getInspections method (not getAllInspections)
    this.housekeepingService.getInspections().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.inspections = response.data;
          this.totalItems = response.totalCount || response.data.length;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.applyFilters();
          this.updateStatistics();
        } else {
          this.errorMessage = response.message || 'Failed to load inspections';
          this.inspections = [];
          this.filteredInspections = [];
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading inspections:', error);
        this.errorMessage = typeof error === 'string' ? error : 'Failed to load inspections. Please try again.';
        this.inspections = [];
        this.filteredInspections = [];
        this.isLoading = false;
      }
    });
  }

  /**
   * Update statistics based on loaded inspections
   */
  updateStatistics(): void {
    this.statistics = {
      totalInspections: this.inspections.length,
      passedInspections: this.inspections.filter(i => i.isPassed).length,
      failedInspections: this.inspections.filter(i => !i.isPassed).length,
      averageScore: this.calculateAverageScore(),
      passRate: this.calculatePassRate(),
      recleanRate: this.calculateRecleanRate()
    };
  }

  /**
   * Load inspection statistics from dashboard
   */
  loadStatistics(): void {
    this.housekeepingService.getDashboardStats().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          // Use dashboard stats if needed
          console.log('Dashboard stats loaded:', response.data);
        }
      },
      error: (error: any) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  /**
   * Load available tasks for dropdown
   */
  loadAvailableTasks(): void {
    this.housekeepingService.getTasks({ page: 1, pageSize: 100 }).subscribe({
      next: (response: any) => {
        if (response.data) {
          this.availableTasks = response.data.filter((task: HousekeepingTask) =>
            task.status === 'Completed' || task.status === 'InProgress'
          );
        }
      },
      error: (error: any) => {
        console.error('Error loading tasks:', error);
      }
    });
  }

  /**
   * Calculate average inspection score
   */
  private calculateAverageScore(): number {
    if (this.inspections.length === 0) return 0;
    const total = this.inspections.reduce((sum, inspection) => sum + inspection.score, 0);
    return Math.round(total / this.inspections.length);
  }

  /**
   * Calculate pass rate
   */
  private calculatePassRate(): number {
    if (this.inspections.length === 0) return 0;
    const passed = this.inspections.filter(i => i.isPassed).length;
    return Math.round((passed / this.inspections.length) * 100);
  }

  /**
   * Calculate reclean rate
   */
  private calculateRecleanRate(): number {
    if (this.inspections.length === 0) return 0;
    const reclean = this.inspections.filter(i => i.recleanRequired).length;
    return Math.round((reclean / this.inspections.length) * 100);
  }

  /**
   * Apply filters
   */
  applyFilters(): void {
    let filtered = [...this.inspections];

    // Filter by result (passed/failed)
    if (this.selectedResult !== 'all') {
      filtered = filtered.filter(i =>
        this.selectedResult === 'passed' ? i.isPassed : !i.isPassed
      );
    }

    // Filter by date range
    if (this.selectedDateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(i => {
        const inspectionDate = new Date(i.inspectionDate);

        switch(this.selectedDateRange) {
          case 'today':
            return inspectionDate >= today;
          case 'week':
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            return inspectionDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            return inspectionDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Filter by search term (room number or inspector)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(i =>
        i.roomNumber.toLowerCase().includes(term) ||
        i.inspectorName.toLowerCase().includes(term) ||
        i.comments.toLowerCase().includes(term)
      );
    }

    // Filter by custom date range
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59);

      filtered = filtered.filter(i => {
        const date = new Date(i.inspectionDate);
        return date >= start && date <= end;
      });
    }

    this.filteredInspections = filtered;
  }

  // ==================== AUTO REFRESH ====================

  private startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      if (!this.showCreateModal && !this.showDetailsModal) {
        this.loadInspections();
      }
    }, 60000); // Refresh every minute
  }

  // ==================== FILTERS ====================

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  resetFilters(): void {
    this.selectedResult = 'all';
    this.selectedDateRange = 'all';
    this.searchTerm = '';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
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
      this.loadInspections();
    }
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadInspections();
  }

  // ==================== INSPECTION CRUD OPERATIONS ====================

  /**
   * Open create inspection modal
   */
  openCreateModal(): void {
    this.newInspection = {
      taskId: null,
      roomId: null,
      roomNumber: '',
      inspectedBy: null,
      inspectorName: '',
      isPassed: true,
      score: 100,
      comments: '',
      recleanRequired: false
    };
    this.showCreateModal = true;
  }

  /**
   * Create new inspection - Using createInspection method
   */
  createInspection(): void {
    // Validate required fields
    if (!this.newInspection.taskId || !this.newInspection.inspectedBy || !this.newInspection.inspectorName) {
      alert('Please fill in all required fields');
      return;
    }

    this.isSubmitting = true;

    const inspectionData = {
      ...this.newInspection,
      inspectionDate: new Date()
    };

    this.housekeepingService.createInspection(inspectionData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.showCreateModal = false;
          this.loadInspections();
          alert('Inspection created successfully');
        } else {
          alert(response.message || 'Failed to create inspection');
        }
        this.isSubmitting = false;
      },
      error: (error: any) => {
        console.error('Error creating inspection:', error);
        alert(typeof error === 'string' ? error : 'Failed to create inspection. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  /**
   * View inspection details
   */
  viewInspectionDetails(inspection: InspectionReport): void {
    this.selectedInspection = inspection;

    // Load related task if exists using getTaskById
    if (inspection.taskId) {
      this.housekeepingService.getTaskById(inspection.taskId).subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            this.relatedTask = response.data;
          }
        },
        error: (error: any) => {
          console.error('Error loading related task:', error);
        }
      });
    }

    // Load related room info using getRoomById
    if (inspection.roomId) {
      this.housekeepingService.getRoomById(inspection.roomId).subscribe({
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
   * Get inspection score color
   */
  getScoreColor(score: number): string {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  }

  /**
   * Get score label
   */
  getScoreLabel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  }

  /**
   * Get pass/fail icon
   */
  getPassFailIcon(isPassed: boolean): string {
    return isPassed ? '✓' : '✗';
  }

  /**
   * Get pass/fail class
   */
  getPassFailClass(isPassed: boolean): string {
    return isPassed ? 'passed' : 'failed';
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
   * Format time only
   */
  formatTimeOnly(date: Date | string | undefined | null): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleTimeString();
    } catch {
      return 'Invalid Time';
    }
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
    this.loadInspections();
  }

  /**
   * Get task type display
   */
  getTaskTypeDisplay(task: HousekeepingTask | null): string {
    if (!task) return 'N/A';
    const types: Record<string, string> = {
      'Checkout': 'Checkout Cleaning',
      'Stayover': 'Stayover Service',
      'DeepClean': 'Deep Cleaning',
      'Turndown': 'Turndown Service'
    };
    return types[task.taskType] || task.taskType;
  }

  /**
   * Get room status display
   */
  getRoomStatusDisplay(status: string): string {
    const statuses: Record<string, string> = {
      'Dirty': 'Dirty',
      'Cleaning': 'Cleaning in Progress',
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
   * Get task ID from inspection (for template)
   */
  getTaskId(): number | undefined {
    return this.selectedInspection?.taskId;
  }

  /**
   * Get room ID from inspection (for template)
   */
  getRoomId(): number | undefined {
    return this.selectedInspection?.roomId;
  }
}
