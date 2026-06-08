// src/app/modules/housekeeping/pages/tasks/tasks.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HousekeepingService } from '../../../../core/services/housekeeping.service';
import {
  HousekeepingTask,
  TaskFilter,
  TaskCompletionData,
  StaffMember,
  Room,
  RoomType
} from '../../../../core/models/housekeeping.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit, OnDestroy {
  // Data
  tasks: HousekeepingTask[] = [];
  selectedTask: HousekeepingTask | null = null;
  staffMembers: StaffMember[] = [];
  rooms: Room[] = [];
  roomTypes: RoomType[] = [];

  // UI State
  isLoading = false;
  isSubmitting = false;
  viewMode: 'list' | 'grid' = 'list';
  selectedStatus: string = 'all';
  selectedPriority: string = 'all';
  searchTerm: string = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Statistics
  statistics: any = null;

  // Modal visibility
  showCreateModal = false;
  showCompleteModal = false;
  showCancelModal = false;
  showReassignModal = false;
  showDetailsModal = false;

  // Error states
  errorMessage: string = '';
  checklistError: string = '';

  // Form data
  newTask: any = {
    priority: 'Normal',
    status: 'Pending',
    taskType: 'Stayover',
    roomId: null,
    roomNumber: '',
    roomType: '',
    assignedTo: null,
    assignedToName: '',
    notes: ''
  };

  cancelReason: string = '';
  reassignStaffId: number | null = null;

  // Completion data
  completionData: TaskCompletionData = {
    checklist: [],
    suppliesUsed: [],
    durationMinutes: 0,
    notes: ''
  };

  private refreshInterval: any;
cdr = inject(ChangeDetectorRef);
  constructor(private housekeepingService: HousekeepingService) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadStatistics();
    this.loadHousekeepingStaff();
    this.loadRooms();
    this.loadRoomTypes();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // ==================== DATA LOADING ====================

  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filter: TaskFilter = {
      page: this.currentPage,
      pageSize: this.pageSize
    };

    if (this.selectedStatus !== 'all') {
      filter.status = this.selectedStatus;
    }

    if (this.selectedPriority !== 'all') {
      filter.priority = this.selectedPriority;
    }

    if (this.searchTerm) {
      filter.searchTerm = this.searchTerm;
    }

    this.housekeepingService.getTasks(filter).subscribe({
      next: (response: any) => {
        console.log('Tasks response:', response);
        this.tasks = response.items;
        this.totalItems = response.totalCount;
        this.totalPages = response.totalPages;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading tasks:', error);
        this.errorMessage = 'Failed to load tasks. Please try again.';
         this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadStatistics(): void {
    this.housekeepingService.getTaskStatistics().subscribe({
      next: (response: any) => {
      //  console.log('Statistics response:', response);
        if (response.success) {
          this.statistics = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading :', error);
      }
    });
  }

  /**
   * Load only housekeeping staff for dropdown
   */
  loadHousekeepingStaff(): void {
    this.housekeepingService.getHousekeepingStaff().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.staffMembers = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading housekeeping staff:', error);
        // Fallback to getStaffByDepartment if needed
        this.housekeepingService.getStaffByDepartment('housekeeping').subscribe({
          next: (response2: any) => {
            if (response2.success) {
              this.staffMembers = response2.data;
            }
          }
        });
      }
    });
  }

  /**
   * Load all rooms for dropdown
   */
  loadRooms(): void {
    this.housekeepingService.getAllRooms().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.rooms = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading rooms:', error);
      }
    });
  }

  /**
   * Load room types
   */
  loadRoomTypes(): void {
    this.housekeepingService.getRoomTypes().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.roomTypes = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading room types:', error);
      }
    });
  }

  /**
   * Handle room selection - auto-populate room type
   */
  onRoomSelect(roomId: number): void {
    const selectedRoom = this.rooms.find(r => r.id === roomId);
    if (selectedRoom) {
      this.newTask.roomNumber = selectedRoom.roomNumber;
      this.newTask.roomType = selectedRoom.roomTypeName;
      this.newTask.roomId = selectedRoom.id;
    }
  }

  loadTaskChecklist(taskType: string): void {
    this.isLoading = true;
    this.checklistError = '';

    this.housekeepingService.getTaskChecklistTemplate(taskType).subscribe({
      next: (response: any) => {
        if (response.success && response.data && response.data.length > 0) {
          this.completionData.checklist = response.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            completed: false,
            notes: ''
          }));
        } else {
          this.checklistError = `No checklist template found for task type: ${taskType}. Please contact administrator.`;
          this.completionData.checklist = [];
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading checklist template:', error);
        this.checklistError = `Failed to load checklist template for ${taskType}. Please try again or contact support.`;
        this.completionData.checklist = [];
        this.isLoading = false;
      }
    });
  }

  // ==================== AUTO REFRESH ====================

  private startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      if (!this.showCreateModal && !this.showCompleteModal &&
          !this.showCancelModal && !this.showReassignModal &&
          !this.showDetailsModal) {
        this.loadTasks();
        this.loadStatistics();
      }
    }, 30000);
  }

  // ==================== FILTERS & PAGINATION ====================

  applyFilters(): void {
    this.currentPage = 1;
    this.loadTasks();
  }

  resetFilters(): void {
    this.selectedStatus = 'all';
    this.selectedPriority = 'all';
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadTasks();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTasks();
    }
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadTasks();
  }

  // ==================== TASK CRUD OPERATIONS ====================

  createTask(): void {
    if (!this.newTask.roomId || !this.newTask.assignedTo) {
      alert('Please select a room and assign a staff member');
      return;
    }

    this.isSubmitting = true;

    const selectedStaff = this.staffMembers.find(s => s.id === this.newTask.assignedTo);
    const taskData = {
      ...this.newTask,
      assignedToName: selectedStaff ? `${selectedStaff.firstName} ${selectedStaff.lastName}` : '',
      assignedAt: new Date(),
      assignedBy: this.getCurrentUserId(),
      assignedByName: this.getCurrentUserName()
    };

    this.housekeepingService.createTask(taskData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.showCreateModal = false;
          this.resetForm();
          this.loadTasks();
          this.loadStatistics();
        } else {
          alert(response.message || 'Failed to create task');
        }
        this.isSubmitting = false;
      },
      error: (error: any) => {
        console.error('Error creating task:', error);
        alert('Failed to create task. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  startTask(taskId: number): void {
    this.housekeepingService.startTask(taskId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.loadTasks();
          this.loadStatistics();
        } else {
          alert(response.message || 'Failed to start task');
        }
      },
      error: (error: any) => {
        console.error('Error starting task:', error);
        alert('Failed to start task. Please try again.');
      }
    });
  }

  openCompleteModal(task: HousekeepingTask): void {
    this.selectedTask = task;
    this.completionData = {
      checklist: [],
      suppliesUsed: [],
      durationMinutes: 0,
      notes: ''
    };
    this.checklistError = '';
    this.loadTaskChecklist(task.taskType);
    this.showCompleteModal = true;
  }

  completeTask(): void {
    if (!this.selectedTask) return;

    if (this.completionData.checklist.length === 0 && !this.checklistError) {
      alert('Checklist is still loading. Please wait...');
      return;
    }

    if (this.checklistError) {
      alert('Cannot complete task: ' + this.checklistError);
      return;
    }

    this.isSubmitting = true;

    this.housekeepingService.completeTask(this.selectedTask.taskId, this.completionData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.showCompleteModal = false;
          this.loadTasks();
          this.loadStatistics();
        } else {
          alert(response.message || 'Failed to complete task');
        }
        this.isSubmitting = false;
      },
      error: (error: any) => {
        console.error('Error completing task:', error);
        alert('Failed to complete task. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  openCancelModal(task: HousekeepingTask): void {
    this.selectedTask = task;
    this.cancelReason = '';
    this.showCancelModal = true;
  }

  cancelTask(): void {
    if (!this.selectedTask || !this.cancelReason) {
      alert('Please provide a reason for cancellation');
      return;
    }

    this.isSubmitting = true;

    this.housekeepingService.cancelTask(this.selectedTask.taskId, this.cancelReason).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.showCancelModal = false;
          this.loadTasks();
          this.loadStatistics();
        } else {
          alert(response.message || 'Failed to cancel task');
        }
        this.isSubmitting = false;
      },
      error: (error: any) => {
        console.error('Error cancelling task:', error);
        alert('Failed to cancel task. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  openReassignModal(task: HousekeepingTask): void {
    this.selectedTask = task;
    this.reassignStaffId = null;
    this.showReassignModal = true;
  }

  reassignTask(): void {
    if (!this.selectedTask || !this.reassignStaffId) {
      alert('Please select a staff member');
      return;
    }

    this.isSubmitting = true;

    this.housekeepingService.reassignTask(this.selectedTask.taskId, this.reassignStaffId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.showReassignModal = false;
          this.loadTasks();
        } else {
          alert(response.message || 'Failed to reassign task');
        }
        this.isSubmitting = false;
      },
      error: (error: any) => {
        console.error('Error reassigning task:', error);
        alert('Failed to reassign task. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  deleteTask(taskId: number): void {
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      this.housekeepingService.deleteTask(taskId).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.loadTasks();
            this.loadStatistics();
          } else {
            alert(response.message || 'Failed to delete task');
          }
        },
        error: (error: any) => {
          console.error('Error deleting task:', error);
          alert('Failed to delete task. Please try again.');
        }
      });
    }
  }

  viewTaskDetails(task: HousekeepingTask): void {
    this.housekeepingService.getTaskById(task.taskId).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.selectedTask = response.data;
          this.showDetailsModal = true;
        } else {
          alert('Failed to load task details');
        }
      },
      error: (error: any) => {
        console.error('Error loading task details:', error);
        alert('Failed to load task details. Please try again.');
      }
    });
  }

  // ==================== HELPER METHODS ====================

  resetForm(): void {
    this.newTask = {
      priority: 'Normal',
      status: 'Pending',
      taskType: 'Stayover',
      roomId: null,
      roomNumber: '',
      roomType: '',
      assignedTo: null,
      assignedToName: '',
      notes: ''
    };
  }

  addSupply(): void {
    this.completionData.suppliesUsed.push({
      id: 0,
      name: '',
      quantity: 0,
      unit: ''
    });
  }

  removeSupply(index: number): void {
    this.completionData.suppliesUsed.splice(index, 1);
  }

  getStaffDisplayName(staff: StaffMember): string {
    return `${staff.firstName} ${staff.lastName} - ${staff.position}`;
  }

  getCurrentUserId(): number {
    // TODO: Implement based on your auth service
    return 1;
  }

  getCurrentUserName(): string {
    // TODO: Implement based on your auth service
    return 'Current User';
  }

  // ==================== CSS CLASS HELPERS ====================

  getPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      'High': 'priority-high',
      'Normal': 'priority-normal',
      'Low': 'priority-low'
    };
    return classes[priority] || '';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'Pending': 'status-pending',
      'InProgress': 'status-progress',
      'Completed': 'status-completed',
      'Failed': 'status-failed',
      'Cancelled': 'status-cancelled'
    };
    return classes[status] || '';
  }

  formatDueTime(date: Date | string | undefined | null): string {
    if (!date) return 'No due date';

    const now = new Date();
    const due = new Date(date);
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 0) return 'Overdue';
    if (diffHours < 1) return `${Math.round(diffHours * 60)} minutes`;
    if (diffHours < 24) return `${Math.round(diffHours)} hours`;
    if (diffHours < 168) return `${Math.round(diffHours / 24)} days`;
    return due.toLocaleDateString();
  }

  isOverdue(date: Date | string | undefined | null): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  formatDate(date: Date | string | undefined | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  }

  dismissError(): void {
    this.errorMessage = '';
    this.checklistError = '';
  }
}
