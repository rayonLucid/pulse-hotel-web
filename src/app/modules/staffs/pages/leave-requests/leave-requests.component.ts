// src/app/modules/staff/pages/leave-requests/leave-requests.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { StaffService } from '../../../../core/services/staff.service';
import { Staff, LeaveRequest, LeaveBalance } from '../../../../core/models/staff.model';

@Component({
  selector: 'app-leave-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './leave-requests.component.html',
  styleUrls: ['./leave-requests.component.scss']
})
export class LeaveRequestsComponent implements OnInit {
  staff: Staff[] = [];
  leaveRequests: LeaveRequest[] = [];
  leaveBalances: LeaveBalance[] = [];
  filteredRequests: LeaveRequest[] = [];
  isLoading = true;
  isSaving = false;
  showRequestModal = false;
  showApproveModal = false;
  showRejectModal = false;
  selectedRequest: LeaveRequest | null = null;
  selectedStaffId: number | null = null;
  selectedStatus: string = '';
  currentYear: number = new Date().getFullYear();
  rejectReason: string = '';
  approveComments: string = '';

  // Leave Request Form
  leaveForm: FormGroup;

  // View mode
  viewMode: 'requests' | 'calendar' | 'balances' = 'requests';

  // Statistics
  stats = {
    pending: 0,
    approved: 0,
    rejected: 0,
    totalDays: 0
  };

  constructor(
    private staffService: StaffService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.leaveForm = this.fb.group({
      staffId: ['', Validators.required],
      leaveType: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadStaff();
    this.loadLeaveRequests();
    this.loadLeaveBalances();
  }

  loadStaff(): void {
    this.staffService.getStaff({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.staff = response.data;
      },
      error: (error) => {
        console.error('Error loading staff:', error);
        this.toastr.error('Failed to load staff', 'Error');
      }
    });
  }

  loadLeaveRequests(): void {
    this.isLoading = true;
    this.staffService.getLeaveRequests(this.selectedStaffId || undefined, this.selectedStatus || undefined).subscribe({
      next: (response) => {
        if (response.success) {
          this.leaveRequests = response.data;
          this.applyFilters();
          this.calculateStatistics();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading leave requests:', error);
        this.toastr.error('Failed to load leave requests', 'Error');
        this.isLoading = false;
      }
    });
  }

  loadLeaveBalances(): void {
    if (this.selectedStaffId) {
      this.staffService.getLeaveBalance(this.selectedStaffId, this.currentYear).subscribe({
        next: (response) => {
          if (response.success) {
            this.leaveBalances = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading leave balances:', error);
        }
      });
    } else {
      // Load balances for all staff or clear
      this.leaveBalances = [];
    }
  }

  applyFilters(): void {
    let filtered = [...this.leaveRequests];

    if (this.selectedStaffId) {
      filtered = filtered.filter(req => req.staffId === this.selectedStaffId);
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(req => req.status === this.selectedStatus);
    }

    this.filteredRequests = filtered;
  }

  calculateStatistics(): void {
    this.stats.pending = this.leaveRequests.filter(r => r.status === 'Pending').length;
    this.stats.approved = this.leaveRequests.filter(r => r.status === 'Approved').length;
    this.stats.rejected = this.leaveRequests.filter(r => r.status === 'Rejected').length;
    this.stats.totalDays = this.leaveRequests.reduce((sum, r) => sum + r.totalDays, 0);
  }

  onStaffFilterChange(): void {
    this.loadLeaveRequests();
    this.loadLeaveBalances();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedStaffId = null;
    this.selectedStatus = '';
    this.loadLeaveRequests();
    this.loadLeaveBalances();
  }

  setViewMode(mode: 'requests' | 'calendar' | 'balances'): void {
    this.viewMode = mode;
    if (mode === 'balances' && this.selectedStaffId) {
      this.loadLeaveBalances();
    }
  }

  openRequestModal(): void {
    this.leaveForm.reset({
      staffId: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: ''
    });
    this.showRequestModal = true;
  }

  closeRequestModal(): void {
    this.showRequestModal = false;
  }

  calculateDays(): number {
    const startDate = this.leaveForm.get('startDate')?.value;
    const endDate = this.leaveForm.get('endDate')?.value;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  }

  submitLeaveRequest(): void {
    if (this.leaveForm.invalid) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    const startDate = new Date(this.leaveForm.get('startDate')?.value);
    const endDate = new Date(this.leaveForm.get('endDate')?.value);

    if (endDate < startDate) {
      this.toastr.warning('End date must be after start date', 'Invalid Dates');
      return;
    }

    this.isSaving = true;
    const leaveData = {
      ...this.leaveForm.value,
      totalDays: this.calculateDays()
    };

    this.staffService.requestLeave(leaveData).subscribe({
      next: (response:any) => {
        this.isSaving = false;
        if (response.success) {
          this.toastr.success('Leave request submitted successfully', 'Success');
          this.closeRequestModal();
          this.loadLeaveRequests();
        } else {
          this.toastr.error(response.message || 'Submission failed', 'Error');
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.toastr.error(error.message || 'Failed to submit request', 'Error');
      }
    });
  }

  openApproveModal(request: LeaveRequest): void {
    this.selectedRequest = request;
    this.approveComments = '';
    this.showApproveModal = true;
  }

  closeApproveModal(): void {
    this.showApproveModal = false;
    this.selectedRequest = null;
    this.approveComments = '';
  }

  approveRequest(): void {
    if (!this.selectedRequest) return;

    this.isSaving = true;
    this.staffService.approveLeave(this.selectedRequest.leaveId, this.approveComments).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success) {
          this.toastr.success('Leave request approved', 'Success');
          this.closeApproveModal();
          this.loadLeaveRequests();
          this.loadLeaveBalances();
        } else {
          this.toastr.error(response.message || 'Approval failed', 'Error');
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.toastr.error(error.message || 'Failed to approve request', 'Error');
      }
    });
  }

  openRejectModal(request: LeaveRequest): void {
    this.selectedRequest = request;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedRequest = null;
    this.rejectReason = '';
  }

  rejectRequest(): void {
    if (!this.selectedRequest) return;

    if (!this.rejectReason.trim()) {
      this.toastr.warning('Please provide a reason for rejection', 'Reason Required');
      return;
    }

    this.isSaving = true;
    this.staffService.rejectLeave(this.selectedRequest.leaveId, this.rejectReason).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success) {
          this.toastr.success('Leave request rejected', 'Success');
          this.closeRejectModal();
          this.loadLeaveRequests();
        } else {
          this.toastr.error(response.message || 'Rejection failed', 'Error');
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.toastr.error(error.message || 'Failed to reject request', 'Error');
      }
    });
  }

  // Helper methods
  getStaffName(staffId: number): string {
    const staff = this.staff.find(s => s.staffId === staffId);
    return staff ? staff.firstName + ' ' + staff.lastName : 'Unknown';
  }

  getStaffDepartment(staffId: number): string {
    const staff = this.staff.find(s => s.staffId === staffId);
    return staff ? staff.department : 'Unknown';
  }

  getLeaveTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'Annual': 'Annual Leave',
      'Sick': 'Sick Leave',
      'Maternity': 'Maternity Leave',
      'Paternity': 'Paternity Leave',
      'Unpaid': 'Unpaid Leave',
      'Compensatory': 'Compensatory Leave'
    };
    return labels[type] || type;
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'Pending': return 'status-pending';
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch(status) {
      case 'Pending': return 'fas fa-clock';
      case 'Approved': return 'fas fa-check-circle';
      case 'Rejected': return 'fas fa-times-circle';
      case 'Cancelled': return 'fas fa-ban';
      default: return 'fas fa-question-circle';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getDaysInMonth(): Date[] {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  }

  getStaffLeaveForDate(staffId: number, date: Date): LeaveRequest | undefined {
    return this.leaveRequests.find(l =>
      l.staffId === staffId &&
      l.status === 'Approved' &&
      new Date(l.startDate) <= date &&
      new Date(l.endDate) >= date
    );
  }

  getLeaveBalanceByType(leaveType: string): number {
    const balance = this.leaveBalances.find(b => b.leaveType === leaveType);
    return balance ? balance.remaining : 0;
  }

  getLeaveBalanceTotal(): number {
    return this.leaveBalances.reduce((sum, b) => sum + b.remaining, 0);
  }

  getLeaveTakenTotal(): number {
    return this.leaveBalances.reduce((sum, b) => sum + b.taken, 0);
  }

  getLeaveEntitledTotal(): number {
    return this.leaveBalances.reduce((sum, b) => sum + b.totalEntitled, 0);
  }

  // src/app/modules/staff/pages/leave-requests/leave-requests.component.ts
// Add these methods to the component class



// Get year for calendar view
getCurrentYear(): number {
  return new Date().getFullYear();
}

// Get days for a specific month
getDaysInMonthForYear(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// src/app/modules/staff/pages/leave-requests/leave-requests.component.ts
// Add these helper methods to the component class

// Check if a leave request falls within a specific month
isLeaveInMonth(request: LeaveRequest, month: number): boolean {
  const startMonth = new Date(request.startDate).getMonth();
  const endMonth = new Date(request.endDate).getMonth();
  return startMonth <= month && endMonth >= month;
}

// Get leave requests for a specific month
getLeavesForMonth(month: number): LeaveRequest[] {
  return this.leaveRequests.filter(request =>
    request.status === 'Approved' && this.isLeaveInMonth(request, month)
  );
}

// Check if staff has approved leave on a specific date
hasStaffLeaveOnDate(staffId: number, date: Date): boolean {
  return this.leaveRequests.some(request =>
    request.staffId === staffId &&
    request.status === 'Approved' &&
    new Date(request.startDate) <= date &&
    new Date(request.endDate) >= date
  );
}
// src/app/modules/staff/pages/leave-requests/leave-requests.component.ts
// Add these methods to the existing component class

// ==================== CALENDAR HELPER METHODS ====================

getMonthName(month: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[month];
}

getYear(): number {
  return new Date().getFullYear();
}




// ==================== FORMATTING HELPER METHODS ====================



formatDateTime(date: Date): string {
  return new Date(date).toLocaleString();
}

// ==================== STAFF HELPER METHODS ====================


getStaffInitials(staffId: number): string {
  const staff = this.staff.find(s => s.staffId === staffId);
  if (!staff) return '??';
  return staff.firstName.charAt(0) + staff.lastName.charAt(0);
}





}
