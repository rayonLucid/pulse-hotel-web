// src/app/modules/staff/pages/attendance/attendance.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { StaffService } from '../../../../core/services/staff.service';
import { Staff, AttendanceLog } from '../../../../core/models/staff.model';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit, OnDestroy {
  staff: Staff[] = [];
  attendanceLogs: AttendanceLog[] = [];
  filteredLogs: AttendanceLog[] = [];
  isLoading = true;
  isCheckingIn = false;
  currentTime: Date = new Date();
  selectedStaffId: number | null = null;
  selectedDate: Date = new Date();
  viewMode: 'list' | 'calendar' | 'report' = 'list';
  private timerInterval: any;
  Math = Math; // Add Math for template usage

  // Date filters
  startDate: Date;
  endDate: Date;

  // Statistics
  stats = {
    totalStaff: 0,
    present: 0,
    absent: 0,
    late: 0,
    onLeave: 0,
    attendanceRate: 0
  };

  // Clock In Form
  clockInForm: FormGroup;
  clockInMethod: string = 'manual';
  showClockInModal = false;
  selectedStaffForClockIn: Staff | null = null;

  // Report generation
  isGeneratingReport = false;
changDet =inject(ChangeDetectorRef)
  constructor(
    private staffService: StaffService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    const today = new Date();
    this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.clockInForm = this.fb.group({
      clockInMethod: ['manual', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadStaff();
    this.loadAttendance();
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  loadStaff(): void {
    this.staffService.getStaff({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.staff = response.data;
        this.stats.totalStaff = this.staff.length;
        this.changDet.detectChanges()
      },
      error: (error) => {
        console.error('Error loading staff:', error);
        this.toastr.error('Failed to load staff', 'Error');
      }
    });
  }

  loadAttendance(): void {
    this.isLoading = true;
    this.staffService.getAttendance(0, this.startDate, this.endDate).subscribe({
      next: (response) => {
       // console.log(response)
        if (response.success) {
          this.attendanceLogs = response.data;
          this.applyFilters();
          this.calculateStatistics();

        }
        this.isLoading = false;
          this.changDet.detectChanges()
      },
      error: (error) => {
        console.error('Error loading attendance:', error);
        this.toastr.error('Failed to load attendance', 'Error');
        this.isLoading = false
        this.changDet.detectChanges()
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.attendanceLogs];

    if (this.selectedStaffId) {
      filtered = filtered.filter(log => log.staffId === this.selectedStaffId);
    }

    this.filteredLogs = filtered;
  }

  calculateStatistics(): void {
    const uniqueStaffIds = new Set(this.attendanceLogs.map(log => log.staffId));
    const totalStaffPresent = uniqueStaffIds.size;

    this.stats.present = this.attendanceLogs.filter(log => log.status === 'Present').length;
    this.stats.absent = this.attendanceLogs.filter(log => log.status === 'Absent').length;
    this.stats.late = this.attendanceLogs.filter(log => log.status === 'Late').length;
    this.stats.onLeave = this.attendanceLogs.filter(log => log.status === 'Leave').length;
    this.stats.attendanceRate = this.stats.totalStaff > 0
      ? Math.round((totalStaffPresent / this.stats.totalStaff) * 100)
      : 0;
  }

  onStaffFilterChange(): void {
    this.applyFilters();
  }

  onDateRangeChange(): void {
    this.loadAttendance();
  }

  setViewMode(mode: 'list' | 'calendar' | 'report'): void {
    this.viewMode = mode;
  }

  openClockInModal(staff: Staff | undefined): void {
    if (!staff) return;
    this.selectedStaffForClockIn = staff;
    this.clockInForm.reset({ clockInMethod: 'manual', notes: '' });
    this.showClockInModal = true;
  }

  closeClockInModal(): void {
    this.showClockInModal = false;
    this.selectedStaffForClockIn = null;
  }

  clockIn(): void {
    if (!this.selectedStaffForClockIn) return;

    this.isCheckingIn = true;
    const method = this.clockInForm.get('clockInMethod')?.value;

    this.staffService.clockIn(this.selectedStaffForClockIn.staffId, method).subscribe({
      next: (response) => {
        this.isCheckingIn = false;
        if (response.success) {
          this.toastr.success(`${this.selectedStaffForClockIn?.firstName} ${this.selectedStaffForClockIn?.lastName} checked in successfully`, 'Clock In');
          this.closeClockInModal();
          this.loadAttendance();
        } else {
          this.toastr.error(response.message || 'Clock in failed', 'Error');
        }
      },
      error: (error) => {
        this.isCheckingIn = false;
        this.toastr.error(error.message || 'Failed to clock in', 'Error');
      }
    });
  }

  clockOut(staffId: number, staffName: string): void {
    if (confirm(`Clock out ${staffName}?`)) {
      this.staffService.clockOut(staffId).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success(`${staffName} checked out successfully`, 'Clock Out');
            this.loadAttendance();
          } else {
            this.toastr.error(response.message || 'Clock out failed', 'Error');
          }
        },
        error: (error) => {
          this.toastr.error(error.message || 'Failed to clock out', 'Error');
        }
      });
    }
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

  getStaffInitials(staffId: number): string {
    const staff = this.staff.find(s => s.staffId === staffId);
    let fullName = staff ? staff.firstName + ' ' + staff.lastName : '';
    if (!staff) return '??';
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getStaffById(staffId: number): Staff | undefined {
    return this.staff.find(s => s.staffId === staffId);
  }

  getStaffStatus(staffId: number, date: Date): string {
    const log = this.attendanceLogs.find(l =>
      l.staffId === staffId &&
      new Date(l.logDate).toDateString() === date.toDateString()
    );
    return log ? log.status : 'Not Recorded';
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'Present': return 'status-present';
      case 'Absent': return 'status-absent';
      case 'Late': return 'status-late';
      case 'HalfDay': return 'status-halfday';
      case 'Leave': return 'status-leave';
      default: return 'status-unknown';
    }
  }

  getStatusIcon(status: string): string {
    switch(status) {
      case 'Present': return 'fas fa-check-circle';
      case 'Absent': return 'fas fa-times-circle';
      case 'Late': return 'fas fa-clock';
      case 'HalfDay': return 'fas fa-adjust';
      case 'Leave': return 'fas fa-umbrella-beach';
      default: return 'fas fa-question-circle';
    }
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDaysInMonth(): Date[] {
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  }

  previousMonth(): void {
    this.selectedDate.setMonth(this.selectedDate.getMonth() - 1);
    this.loadAttendance();
  }

  nextMonth(): void {
    this.selectedDate.setMonth(this.selectedDate.getMonth() + 1);
    this.loadAttendance();
  }

  generateReport(): void {
    this.isGeneratingReport = true;
    // Call API to generate report
    this.staffService.exportAttendanceReport(this.startDate, this.endDate).subscribe({
      next: (blob) => {
        this.isGeneratingReport = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_report_${this.startDate.toISOString().split('T')[0]}_to_${this.endDate.toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastr.success('Report downloaded successfully', 'Export Complete');
      },
      error: (error) => {
        this.isGeneratingReport = false;
        console.error('Error exporting report:', error);
        this.toastr.error('Failed to export report', 'Error');
      }
    });
  }

  exportToExcel(): void {
    this.generateReport();
  }
}
