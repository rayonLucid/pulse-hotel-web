// src/app/modules/staff/pages/staff-detail/staff-detail.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { StaffService } from '../../../../core/services/staff.service';
import { Staff, ShiftAssignment, AttendanceLog, LeaveRequest, PerformanceReview } from '../../../../core/models/staff.model';

@Component({
  selector: 'app-staff-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './staff-detail.component.html',
  styleUrls: ['./staff-detail.component.scss']
})
export class StaffDetailComponent implements OnInit {
  staff: Staff | null = null;
  shiftAssignments: ShiftAssignment[] = [];
  attendanceLogs: AttendanceLog[] = [];
  leaveRequests: LeaveRequest[] = [];
  performanceReviews: PerformanceReview[] = [];
  isLoading = true;
  isEditing = false;
  isSaving = false;
  showDeleteModal = false;
  activeTab: 'profile' | 'schedules' | 'attendance' | 'leaves' | 'performance' = 'profile';
  isAddMode =false;
  // Edit Form
  editForm: FormGroup;

  // Date filters
  scheduleStartDate: Date;
  scheduleEndDate: Date;
  attendanceStartDate: Date;
  attendanceEndDate: Date;

  departments: string[] = ['Front Desk', 'Housekeeping', 'Maintenance', 'Food & Beverage', 'Security', 'Administration', 'Sales & Marketing', 'Spa & Wellness'];
  employmentTypes: string[] = ['Full-Time', 'Part-Time', 'Contract', 'Casual'];
  positions: string[] = ['Manager', 'Supervisor', 'Senior Staff', 'Junior Staff', 'Trainee'];
private changeDet =inject(ChangeDetectorRef);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private staffService: StaffService,
    private toastr: ToastrService
  ) {
    // Initialize dates
    const today = new Date();
    this.scheduleStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.scheduleEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.attendanceStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.attendanceEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.editForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      employeeNumber: ['', [Validators.required]],
      department: ['', [Validators.required]],
      position: ['', [Validators.required]],
      jobTitle: ['', [Validators.required]],
      employmentType: ['', [Validators.required]],
      hireDate: ['', [Validators.required]],
      basicSalary: [''],
      hourlyRate: [''],
      bankName: [''],
      accountNumber: [''],
      emergencyContactName: [''],
      emergencyContactPhone: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStaff(parseInt(id));
      this.loadShiftAssignments(parseInt(id));
      this.loadAttendanceLogs(parseInt(id));
      this.loadLeaveRequests(parseInt(id));
      this.loadPerformanceReviews(parseInt(id));
    } else {
      this.isAddMode = true;
      this.isLoading = false;
      this.setActiveTab('profile');
      this.changeDet.detectChanges();
    //  this.router.navigate(['/staff']);
    }
  }

  loadStaff(id: number): void {
    this.isLoading = true;
    this.staffService.getStaffById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.staff = response.data;
          this.populateForm();
          this.isLoading = false;
        } else {
          this.toastr.error('Staff member not found', 'Error');
          this.router.navigate(['/staff']);
        }
      },
      error: (error) => {
        console.error('Error loading staff:', error);
        this.toastr.error('Failed to load staff details', 'Error');
        this.isLoading = false;
        this.router.navigate(['/staff']);
      }
    });
  }

  loadShiftAssignments(staffId: number): void {
    this.staffService.getShiftAssignments(staffId, this.scheduleStartDate, this.scheduleEndDate).subscribe({
      next: (response) => {
        if (response.success) {
          this.shiftAssignments = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading shift assignments:', error);
      }
    });
  }

  loadAttendanceLogs(staffId: number): void {
    this.staffService.getAttendance(staffId, this.attendanceStartDate, this.attendanceEndDate).subscribe({
      next: (response) => {
        if (response.success) {
          this.attendanceLogs = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading attendance logs:', error);
      }
    });
  }

  loadLeaveRequests(staffId: number): void {
    this.staffService.getLeaveRequests(staffId).subscribe({
      next: (response) => {
        if (response.success) {
          this.leaveRequests = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading leave requests:', error);
      }
    });
  }

  loadPerformanceReviews(staffId: number): void {
    this.staffService.getPerformanceReviews(staffId).subscribe({
      next: (response) => {
        if (response.success) {
          this.performanceReviews = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading performance reviews:', error);
      }
    });
  }

  populateForm(): void {
    if (!this.staff) return;

    this.editForm.patchValue({
      fullName: this.staff.fullName,
      email: this.staff.email,
      phoneNumber: this.staff.phoneNumber,
      employeeNumber: this.staff.employeeNumber,
      department: this.staff.department,
      position: this.staff.position,
      jobTitle: this.staff.jobTitle,
      employmentType: this.staff.employmentType,
      hireDate: this.staff.hireDate ? new Date(this.staff.hireDate).toISOString().split('T')[0] : '',
      basicSalary: this.staff.basicSalary || '',
      hourlyRate: this.staff.hourlyRate || '',
      bankName: this.staff.bankName || '',
      accountNumber: this.staff.accountNumber || '',
      emergencyContactName: this.staff.emergencyContactName || '',
      emergencyContactPhone: this.staff.emergencyContactPhone || ''
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.populateForm();
    }
  }

  saveStaff(): void {
    if (this.editForm.invalid) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    this.isSaving = true;
    const updatedStaff = this.editForm.value;

    this.staffService.updateStaff(this.staff!.staffId, updatedStaff).subscribe({
      next: (response:any) => {
        this.isSaving = false;
        if (response.success) {
          this.toastr.success('Staff member updated successfully', 'Success');
          this.isEditing = false;
          this.loadStaff(this.staff!.staffId);
        } else {
          this.toastr.error(response.message || 'Update failed', 'Error');
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.toastr.error(error.message || 'Failed to update staff', 'Error');
      }
    });
  }

  deactivateStaff(): void {
    this.isSaving = true;
    this.staffService.deleteStaff(this.staff!.staffId).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success) {
          this.toastr.success('Staff member deactivated', 'Success');
          this.router.navigate(['/staff']);
        } else {
          this.toastr.error(response.message || 'Deactivation failed', 'Error');
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.toastr.error(error.message || 'Failed to deactivate staff', 'Error');
      }
    });
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    this.deactivateStaff();
    this.closeDeleteModal();
  }

  goBack(): void {
    this.router.navigate(['/staff']);
  }

  setActiveTab(tab: 'profile' | 'schedules' | 'attendance' | 'leaves' | 'performance'): void {
    this.activeTab = tab;
this.changeDet.detectChanges();
    if (tab === 'schedules') {
      this.loadShiftAssignments(this.staff!.staffId);
    } else if (tab === 'attendance') {
      this.loadAttendanceLogs(this.staff!.staffId);
    } else if (tab === 'leaves') {
      this.loadLeaveRequests(this.staff!.staffId);
    } else if (tab === 'performance') {
      this.loadPerformanceReviews(this.staff!.staffId);
    }
    this.changeDet.detectChanges();
  }

  updateScheduleDates(): void {
    this.loadShiftAssignments(this.staff!.staffId);
  }

  updateAttendanceDates(): void {
    this.loadAttendanceLogs(this.staff!.staffId);
  }

  getInitials(name: string|undefined): string {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
  }

  getStatusClass(isActive: boolean|undefined): string {
    return isActive ? 'badge-success' : 'badge-danger';
  }

  getStatusText(isActive: boolean|undefined): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getAttendanceStatusClass(status: string|undefined): string {
    switch(status) {
      case 'Present': return 'status-present';
      case 'Absent': return 'status-absent';
      case 'Late': return 'status-late';
      case 'HalfDay': return 'status-halfday';
      case 'Holiday': return 'status-holiday';
      case 'Leave': return 'status-leave';
      default: return '';
    }
  }

  getLeaveStatusClass(status: string|undefined): string {
    switch(status) {
      case 'Pending': return 'status-pending';
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      default: return '';
    }
  }

  getPerformanceRatingClass(rating: number|undefined): string {
    if (rating && rating >= 4.5) return 'rating-excellent';
    if (rating && rating >= 3.5) return 'rating-good';
    if (rating && rating >= 2.5) return 'rating-average';
    if (rating && rating >= 1.5) return 'rating-poor';
    return 'rating-bad';
  }



  formatTime(time: Date | string): string {
    return new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatPrice(price: number): string {
    return `₦${price.toLocaleString()}`;
  }
}
