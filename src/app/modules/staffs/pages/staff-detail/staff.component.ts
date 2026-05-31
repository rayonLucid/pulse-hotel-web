// src/app/modules/staff/pages/staff-detail/staff-detail.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { StaffService } from '../../../../core/services/staff.service';
import { Staff, ShiftAssignment, AttendanceLog, LeaveRequest, PerformanceReview } from '../../../../core/models/staff.model';
import { Bank, BankService } from '../../../../core/services/bank.service';
import { Role } from '../../../../core/models/roles.model';
import { RoleService } from '../../../../core/services/role.service';
import { Department } from '../../../../core/models/ department.model';
import { DepartmentService } from '../../../../core/services/department';

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


  // Bank validation properties
  banks: Bank[] = [];
  isVerifyingAccount = false;
  accountVerified = false;
  accountName = '';
  bankCode = '';

  // Date filters
  scheduleStartDate: Date;
  scheduleEndDate: Date;
  attendanceStartDate: Date;
  attendanceEndDate: Date;
mismatch:boolean =false
  departments: Department[] = [];
  employmentTypes: string[] = ['Full-Time', 'Part-Time', 'Contract', 'Casual'];
  positions: string[] = ['Manager', 'Supervisor', 'Senior Staff', 'Junior Staff', 'Trainee'];
private changeDet =inject(ChangeDetectorRef);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private roleService: RoleService,
    private deptService:DepartmentService,
    private staffService: StaffService,
    private bankService: BankService,
    private toastr: ToastrService
  ) {
    // Initialize dates
    const today = new Date();
    this.scheduleStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.scheduleEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.attendanceStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.attendanceEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.editForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
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
      emergencyContactPhone: [''],
     password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]] ,
      salaryGrade: [ '' ]
    } );
  }

  ngOnInit(): void {
     this.banks = this.bankService.getBanks();
    this.loadDepartments();
    const id = this.route.snapshot.paramMap.get('id');
    const action = this.route.snapshot.paramMap.get('action');
    if(action && id){
      console.log(action)
      if(action =='view'){
        this.isEditing=false
        this.isAddMode =false
         this.setActiveTab('profile');
      this.changeDet.detectChanges();
      }
      else if(action =='edit'){
        this.isEditing=true
        this.isAddMode =false
        //  this.setActiveTab('profile');
      this.changeDet.detectChanges();
      }
    }
    if (id && action) {
      console.log("Editing")
      this.loadStaff(parseInt(id),action);
      this.loadShiftAssignments(parseInt(id));
      this.loadAttendanceLogs(parseInt(id));
      this.loadLeaveRequests(parseInt(id));
      this.loadPerformanceReviews(parseInt(id));
    } else if(!action && !id) {
      this.isAddMode = true;
      this.isLoading = false;
      this.setActiveTab('profile');
      this.changeDet.detectChanges();
    //  this.router.navigate(['/staff']);
    }
  }
  loadDepartments() {
    this.deptService.getDepartments(true).subscribe(
    {

      next:(res: any) =>
        {
      this.departments = res.data;
      console.log('Loaded departments:', this.departments);
    }
    ,error:(error) => {
         console.error('Error loading departments:', error);
    }
    })

  }


  passwordMatchValidator = (form: FormGroup) => {

  const password = form.get('password')?.value;
  const confirm = form.get('confirmPassword')?.value;
console.log(password)
  if (password !== confirm) {
  //  form.get('confirmPassword')?.setErrors({ mismatch: true });
  this.mismatch =true
  this.changeDet.detectChanges()
  } else {
   // form.get('confirmPassword')?.setErrors(null);
   this.mismatch =false
   this.changeDet.detectChanges()
  }
  return null;
}


  loadStaff(id: number,action:string): void {
    this.isLoading = true;
    this.staffService.getStaffById(id).subscribe({
      next: (response) => {
      //  console.log(response)
        if (response.success) {
          this.isEditing =(action=='edit')
          this.staff = response.data;
          this.populateForm();
          this.isLoading = false;
          this.changeDet.detectChanges()
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
        console.error('loading shift assignments:', error);
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
        console.error('Error loading attendance:', error);
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
        console.error('Error loading leave:', error);
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
        console.error('Error  performance reviews:', error);
      }
    });
  }

  populateForm(): void {
    if (!this.staff) return;

    this.editForm.patchValue({
      firstName: this.staff.firstName,
      lastName: this.staff.lastName,
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

  getInitials(): string {
   let name =this.staff?.firstName + ' ' + this.staff?.lastName;
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

// Add this method to the component

// Create new staff member
createStaff(): void {
  if (this.editForm.invalid) {
    this.toastr.warning('Please fill all required fields', 'Validation Error');
    return;
  }

  this.isSaving = true;
  const { confirmPassword, ...staffData } = this.editForm.value;
//console.log(staffData)
  this.staffService.createStaff(staffData).subscribe({
    next: (response:any) => {
      this.isSaving = false;
      if (response.success) {
        this.toastr.success('Staff member created successfully', 'Success');
        this.router.navigate(['/staff/detail', response.data.staffId]);
      } else {
        this.toastr.error(response.message || 'Creation failed', 'Error');
      }
    },
    error: (error) => {
      this.isSaving = false;
      console.log(error)
      this.toastr.error(error.message || 'Failed to create staff', 'Error');
    }
  });
}

// Update existing staff member
updateStaff(): void {
  if (this.editForm.invalid) {
    this.toastr.warning('Please fill all required fields', 'Validation Error');
    return;
  }

  this.isSaving = true;
  const staffData = this.editForm.value;

  this.staffService.updateStaff(this.staff!.staffId, staffData).subscribe({
    next: (response:any) => {
      this.isSaving = false;
      if (response.success) {
        this.toastr.success('Staff member updated successfully', 'Success');
        this.isEditing = false;
        this.loadStaff(this.staff!.staffId,'');
        this.changeDet.detectChanges();
      } else {
        this.toastr.error(response.message || 'Update failed', 'Error');
        this.changeDet.detectChanges();
      }
    },
    error: (error) => {
      this.isSaving = false;
      this.toastr.error(error.message || 'Failed to update staff', 'Error');
      this.changeDet.detectChanges();
    }
  });
}

// Save staff (handles both create and update)
saveStaff(): void {
  // if(this.accountVerified ==false){
  //       this.toastr.warning('Please verify account number', 'Verification Failed');
  //       this.isSaving =false
  //       this.changeDet.detectChanges()
  //   return
  // }
  if (this.isAddMode) {
    this.createStaff();
  } else {
    this.updateStaff();
  }
}

// Validate bank account number
  async validateBankAccount(): Promise<void> {
    const accountNumber = this.editForm.get('accountNumber')?.value;
    const bankCode = this.bankCode;

    if (!accountNumber || accountNumber.length !== 10) {
      this.accountVerified = false;
      this.accountName = '';
      this.toastr.warning('Please enter a valid 10-digit account number', 'Validation Error');
      return;
    }

    if (!bankCode) {
      this.accountVerified = false;
      this.accountName = '';
      this.toastr.warning('Please select a bank first', 'Validation Error');
      return;
    }

    this.isVerifyingAccount = true;

    // First do local validation
    const localValidation = this.bankService.validateAccountLocally(accountNumber, bankCode);
console.log('Local validation result:', localValidation);
    if (!localValidation.valid) {
      this.isVerifyingAccount = false;
      this.accountVerified = false;
      this.toastr.warning(localValidation.message, 'Invalid Account');
      return;
    }

    // If local validation passes, try API validation (optional)
    this.bankService.validateAccountWithPaystack(accountNumber, bankCode).subscribe({
      next: (response) => {
        this.isVerifyingAccount = false;
        console.log('API validation response:', response);
        if (response.success && response.data) {
          this.accountVerified = true;
          this.accountName = response.data.account_name;
          this.toastr.success(`Account verified: ${response.data.account_name}`, 'Account Verified');
          this.changeDet.detectChanges()
        } else {
          this.accountVerified = false;
          this.accountName = '';
          this.toastr.warning(response.message || 'Account verification failed', 'Verification Failed');
          this.changeDet.detectChanges()
        }
      },
      error: (error) => {
        this.isVerifyingAccount = false;
        console.error('API validation:', error);
        // If API fails, still accept the account based on local validation
        if (localValidation.valid) {
          this.accountVerified = true;
          this.accountName = 'Account number format valid (API unavailable)';
          this.toastr.info('Account format verified locally. Please confirm with bank if needed.', 'Local Verification');
          this.changeDet.detectChanges();
        }
      }
    });
  }

  // Format account number as user types
  formatAccountNumberInput(): void {
    let accountNumber = this.editForm.get('accountNumber')?.value || '';
    // Remove non-digits
    accountNumber = accountNumber.replace(/\D/g, '');
    // Limit to 10 digits
    if (accountNumber.length > 10) {
      accountNumber = accountNumber.slice(0, 10);
    }
    this.editForm.get('accountNumber')?.setValue(accountNumber, { emitEvent: false });

    // Reset verification when account number changes
    if (this.accountVerified) {
      this.accountVerified = false;
      this.accountName = '';
    }
  }

  // Reset verification when bank changes
  onBankChange(bankCode: any): void {
    this.bankCode = bankCode.value;
    this.accountVerified = false;
    this.accountName = '';

    // Clear account number if bank changes
    if (this.editForm.get('accountNumber')?.value) {
      this.editForm.get('accountNumber')?.setValue('');
    }
  }

  // Get bank name by code
  getBankName(bankCode: string): string {
    const bank = this.banks.find(b => b.code === bankCode);
    return bank ? bank.name : '';
  }


}
