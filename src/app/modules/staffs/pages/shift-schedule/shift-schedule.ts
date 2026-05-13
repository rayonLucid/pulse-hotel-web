// src/app/modules/staff/pages/shift-schedule/shift-schedule.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { StaffService } from '../../../../core/services/staff.service';
import { Shift, ShiftAssignment, Staff } from '../../../../core/models/staff.model';

@Component({
  selector: 'app-shift-schedule',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './shift-schedule.component.html',
  styleUrls: ['./shift-schedule.component.scss']
})
export class ShiftScheduleComponent implements OnInit {
  shifts: Shift[] = [];
  staff: Staff[] = [];
  shiftAssignments: ShiftAssignment[] = [];
  isLoading = true;
  isSaving = false;
  showCreateModal = false;
  showShiftModal = false;
  selectedDate: Date = new Date();
  selectedWeek: Date[] = [];
  selectedStaff: Staff | null = null;
  editingShift: Shift | null = null;

  // View mode
  viewMode: 'week' | 'month' | 'staff' = 'week';

  // Form
  shiftForm: FormGroup;
  assignmentForm: FormGroup;

  // Calendar data
  calendarDays: { date: Date; assignments: ShiftAssignment[] }[] = [];

  // Available shifts for dropdown
  availableShifts: Shift[] = [];

  constructor(
    private staffService: StaffService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.shiftForm = this.fb.group({
      shiftName: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      breakDuration: [60],
      overnightShift: [false],
      shiftAllowance: [0],
      departmentId: ['']
    });

    this.assignmentForm = this.fb.group({
      staffId: ['', [Validators.required]],
      shiftId: ['', [Validators.required]],
      assignmentDate: ['', [Validators.required]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadShifts();
    this.loadStaff();
    this.generateWeekDays();
  }

  loadShifts(): void {
    this.staffService.getShifts().subscribe({
      next: (response) => {
        if (response.success) {
          this.shifts = response.data;
          this.availableShifts = this.shifts.filter(s => s.isActive);
        }
      },
      error: (error) => {
        console.error('Error loading shifts:', error);
        this.toastr.error('Failed to load shifts', 'Error');
      }
    });
  }

  loadStaff(): void {
    this.staffService.getStaff({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.staff = response.data;
      },
      error: (error) => {
        console.error('Error loading staff:', error);
      }
    });
  }

  loadShiftAssignments(): void {
    const startDate = this.selectedWeek[0];
    const endDate = this.selectedWeek[this.selectedWeek.length - 1];

    // For simplicity, load assignments for all staff in the selected week
    // In production, you'd want to load based on department or filter
    this.staffService.getShiftAssignments(0, startDate, endDate).subscribe({
      next: (response) => {
        if (response.success) {
          this.shiftAssignments = response.data;
          this.updateCalendarDays();
        }
      },
      error: (error) => {
        console.error('Error loading shift assignments:', error);
      }
    });
  }

  generateWeekDays(): void {
    const startOfWeek = new Date(this.selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    this.selectedWeek = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      this.selectedWeek.push(date);
    }

    this.loadShiftAssignments();
  }

  updateCalendarDays(): void {
    this.calendarDays = this.selectedWeek.map(date => ({
      date: date,
      assignments: this.shiftAssignments.filter(
        a => new Date(a.assignmentDate).toDateString() === date.toDateString()
      )
    }));
  }

  previousWeek(): void {
    this.selectedDate.setDate(this.selectedDate.getDate() - 7);
    this.generateWeekDays();
  }

  nextWeek(): void {
    this.selectedDate.setDate(this.selectedDate.getDate() + 7);
    this.generateWeekDays();
  }

  goToToday(): void {
    this.selectedDate = new Date();
    this.generateWeekDays();
  }

  setViewMode(mode: 'week' | 'month' | 'staff'): void {
    this.viewMode = mode;
    if (mode === 'week') {
      this.generateWeekDays();
    }
  }

  openShiftModal(shift?: Shift): void {
    this.editingShift = shift || null;
    if (shift) {
      this.shiftForm.patchValue({
        shiftName: shift.shiftName,
        startTime: shift.startTime,
        endTime: shift.endTime,
        breakDuration: shift.breakDuration,
        overnightShift: shift.overnightShift,
        shiftAllowance: shift.shiftAllowance,
        departmentId: shift.departmentId || ''
      });
    } else {
      this.shiftForm.reset({
        breakDuration: 60,
        overnightShift: false,
        shiftAllowance: 0
      });
    }
    this.showShiftModal = true;
  }

  closeShiftModal(): void {
    this.showShiftModal = false;
    this.editingShift = null;
  }

  saveShift(): void {
    if (this.shiftForm.invalid) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    this.isSaving = true;
    const shiftData = this.shiftForm.value;

    if (this.editingShift) {
      this.staffService.updateShift(this.editingShift.shiftId, shiftData).subscribe({
        next: (response:any) => {
          this.isSaving = false;
          if (response.success) {
            this.toastr.success('Shift updated successfully', 'Success');
            this.closeShiftModal();
            this.loadShifts();
          } else {
            this.toastr.error(response.message || 'Update failed', 'Error');
          }
        },
        error: (error:any) => {
          this.isSaving = false;
          this.toastr.error(error.message || 'Failed to update shift', 'Error');
        }
      });
    } else {
      this.staffService.createShift(shiftData).subscribe({
        next: (response:any) => {
          this.isSaving = false;
          if (response.success) {
            this.toastr.success('Shift created successfully', 'Success');
            this.closeShiftModal();
            this.loadShifts();
          } else {
            this.toastr.error(response.message || 'Creation failed', 'Error');
          }
        },
        error: (error:any) => {
          this.isSaving = false;
          this.toastr.error(error.message || 'Failed to create shift', 'Error');
        }
      });
    }
  }

  deleteShift(shiftId: number): void {
    if (confirm('Are you sure you want to delete this shift?')) {
      this.staffService.deleteShift(shiftId).subscribe({
        next: (response:any) => {
          if (response.success) {
            this.toastr.success('Shift deleted successfully', 'Success');
            this.loadShifts();
          } else {
            this.toastr.error(response.message || 'Delete failed', 'Error');
          }
        },
        error: (error:any) => {
          this.toastr.error(error.message || 'Failed to delete shift', 'Error');
        }
      });
    }
  }

  openCreateModal(date?: Date): void {
    if (date) {
      this.assignmentForm.patchValue({
        assignmentDate: date.toISOString().split('T')[0]
      });
    }
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.selectedStaff = null;
    this.assignmentForm.reset();
  }

  createAssignment(): void {
    if (this.assignmentForm.invalid) {
      this.toastr.warning('Please select staff, shift, and date', 'Validation Error');
      return;
    }

    this.isSaving = true;
    const assignmentData = this.assignmentForm.value;

    this.staffService.assignShift(assignmentData).subscribe({
      next: (response:any) => {
        this.isSaving = false;
        if (response.success) {
          this.toastr.success('Shift assigned successfully', 'Success');
          this.closeCreateModal();
          this.loadShiftAssignments();
        } else {
          this.toastr.error(response.message || 'Assignment failed', 'Error');
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.toastr.error(error.message || 'Failed to assign shift', 'Error');
      }
    });
  }

  cancelAssignment(assignmentId: number): void {
    if (confirm('Are you sure you want to cancel this shift assignment?')) {
      this.staffService.cancelShiftAssignment(assignmentId).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success('Shift assignment cancelled', 'Success');
            this.loadShiftAssignments();
          } else {
            this.toastr.error(response.message || 'Cancellation failed', 'Error');
          }
        },
        error: (error) => {
          this.toastr.error(error.message || 'Failed to cancel assignment', 'Error');
        }
      });
    }
  }

  getStaffName(staffId: number): string {
    const staff = this.staff.find(s => s.staffId === staffId);
    return staff ? staff.firstName + ' ' + staff.lastName : 'Unknown';
   // return staff ? staff.fullName : 'Unknown';
  }

  getShiftName(shiftId: number): string {
    const shift = this.shifts.find(s => s.shiftId === shiftId);
    return shift ? shift.shiftName : 'Unknown';
  }

  getShiftTime(shiftId: number): string {
    const shift = this.shifts.find(s => s.shiftId === shiftId);
    return shift ? `${shift.startTime} - ${shift.endTime}` : '';
  }

  getShiftColor(shiftName: string): string {
    const colors: { [key: string]: string } = {
      'Morning': '#10b981',
      'Afternoon': '#3b82f6',
      'Night': '#8b5cf6',
      'Split': '#f59e0b'
    };
    return colors[shiftName] || '#6b7280';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  isToday(date: Date): boolean {
    return new Date(date).toDateString() === new Date().toDateString();
  }

  // src/app/modules/staff/pages/shift-schedule/shift-schedule.component.ts
// Add these helper methods to the component class

// Check if assignment matches the shift and date
isAssignmentForShiftAndDate(assignment: ShiftAssignment, shiftId: number, date: Date): boolean {
  return assignment.shiftId === shiftId &&
         new Date(assignment.assignmentDate).toDateString() === date.toDateString();
}

// Get assignments for a specific shift and date
getAssignmentsForShiftAndDate(shiftId: number, date: Date): ShiftAssignment[] {
  return this.shiftAssignments.filter(a =>
    a.shiftId === shiftId &&
    new Date(a.assignmentDate).toDateString() === date.toDateString()
  );
}

// Get shift assignment for a staff member on a specific date
getStaffShiftForDate(staffId: number, date: Date): ShiftAssignment | undefined {
  return this.shiftAssignments.find(a =>
    a.staffId === staffId &&
    new Date(a.assignmentDate).toDateString() === date.toDateString()
  );
}

// Check if staff has assignment on date
hasAssignmentOnDate(staffId: number, date: Date): boolean {
  return this.shiftAssignments.some(a =>
    a.staffId === staffId &&
    new Date(a.assignmentDate).toDateString() === date.toDateString()
  );
}
// Add these methods to the ShiftScheduleComponent class

getStaffInitials(): string {
  let name = '';
  if (this.staff.length > 0) {
    name = this.staff[0].firstName + ' ' + this.staff[0].lastName;
  }
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

openCreateModalForStaff(staff: Staff): void {
  this.selectedStaff = staff;
  this.assignmentForm.patchValue({
    staffId: staff.staffId,
    assignmentDate: new Date().toISOString().split('T')[0]
  });
  this.showCreateModal = true;
}

formatPrice(price: number): string {
  return `₦${price.toLocaleString()}`;
}


//-------------------------------------

}
