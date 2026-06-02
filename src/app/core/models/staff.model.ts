// src/app/core/models/staff.model.ts
export interface Staff {
  staffId: number;
  userId: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department: string;
  position: string;
  jobTitle: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Casual';
  hireDate?: Date |undefined;
  confirmationDate?: Date |undefined;
  terminationDate?: Date |undefined;
  salaryGrade?: string;
  basicSalary?: number;
  hourlyRate?: number;
  bankName?: string;
  accountNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  profilePhotoUrl?: string;
  isActive?: boolean;
  roleName: string;
}

export interface Shift {
  shiftId: number;
  shiftName: string;
  departmentId?: number;
  departmentName?: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  overnightShift: boolean;
  shiftAllowance: number;
  isActive: boolean;
}

export interface ShiftAssignment {
  assignmentId: number;
  staffId: number;
  staffName: string;
  shiftId: number;
  shiftName: string;
  assignmentDate: Date;
  startTime: string;
  endTime: string;
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Missed' | 'Cancelled';
  checkInTime?: Date;
  checkOutTime?: Date;
  actualHoursWorked?: number;
  overtimeHours?: number;
}

export interface ClockInRequest {
  shiftId?: number;
  clockInMethod?: string;
  notes?: string;
}

export interface ClockOutRequest {
  clockOutMethod?: string;
  notes?: string;

}

export interface AttendanceLog {
  logId: number;
  staffId: number;
  staffName: string;
  logDate: Date;
  clockInTime?: Date;
  clockOutTime?: Date;
  clockInMethod?: string;
  clockOutMethod?: string;
  isLate: boolean;
  lateMinutes: number;
  isEarlyDeparture: boolean;
  earlyDepartureMinutes: number;
  status: 'Present' | 'Absent' | 'Late' | 'HalfDay' | 'Holiday' | 'Leave';
}

export interface LeaveRequest {
  leaveId: number;
  staffId: number;
  staffName: string;
  leaveType: 'Annual' | 'Sick' | 'Maternity' | 'Paternity' | 'Unpaid' | 'Compensatory';
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  approvedBy?: number;
  approverName?: string;
  approvalDate?: Date;
  comments?: string;
  createdAt: Date;
}

export interface LeaveBalance {
  balanceId: number;
  staffId: number;
  year: number;
  leaveType: string;
  totalEntitled: number;
  taken: number;
  remaining: number;
}

export interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  onLeave: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  departments: { name: string; count: number }[];
}
export interface StaffCurrentStatusDto {
  shiftId?: number;
  shiftName?: string;
  shiftStartTime?: string; // TimeSpan is string in JS/TS
  shiftEndTime?: string; // TimeSpan is string in JS/TS
  clockInTime?: Date;
  logId?: number;
  isOnDuty: boolean;
  hasShiftAssignment: boolean;
  lateMinutes: number;
}
export interface StaffFilter {
  department?: string;
  status?: string;
  employmentType?: string;
  searchTerm?: string;
  page: number;
  pageSize: number;
}

// src/app/core/models/staff.model.ts
// Add these interfaces to your existing staff.model.ts file

export interface PerformanceReview {
  reviewId: number;
  staffId: number;
  staffName: string;
  reviewerId: number;
  reviewerName: string;
  reviewPeriodStart: Date;
  reviewPeriodEnd: Date;
  reviewDate: Date;
  overallRating: number;
  strengths: string;
  areasForImprovement: string;
  goalsForNextPeriod: string;
  promotionRecommended: boolean;
  salaryIncreaseRecommended: boolean;
  salaryIncreasePercentage?: number;
  status: 'Draft' | 'Submitted' | 'Acknowledged';
  staffComments?: string;
  acknowledgementDate?: Date;
  createdAt: Date;
}

export interface PerformanceMetric {
  metricId: number;
  metricName: string;
  category: string;
  weight: number;
  target: number;
  actual: number;
  score: number;
  comments?: string;
}

export interface PerformanceDashboard {
  totalReviews: number;
  averageRating: number;
  pendingReviews: number;
  reviewsByRating: { rating: number; count: number }[];
  topPerformers: PerformanceReview[];
  recentReviews: PerformanceReview[];
}

export interface CreatePerformanceReview {
  staffId: number;
  reviewPeriodStart: Date;
  reviewPeriodEnd: Date;
  overallRating: number;
  strengths: string;
  areasForImprovement: string;
  goalsForNextPeriod: string;
  promotionRecommended: boolean;
  salaryIncreaseRecommended: boolean;
  salaryIncreasePercentage?: number;
}
