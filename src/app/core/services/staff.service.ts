// src/app/core/services/staff.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';

import { Staff, StaffFilter, StaffStats, Shift, ShiftAssignment,
   AttendanceLog, LeaveRequest, LeaveBalance,
   StaffCurrentStatusDto,
   ClockInRequest,
   ClockOutRequest} from '../models/staff.model';
import { PerformanceReview, CreatePerformanceReview, PerformanceDashboard, PerformanceMetric } from '../models/performance.model';
import { SearchResult } from './search.service';
import { AppConfigService } from './app.config.service';

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private apiUrl = ``;

  constructor(private http: HttpClient,private config :AppConfigService) {
      this.apiUrl = `${this.config.apiUrl}/staff`;
  }

  // Staff Management
  getStaff(filter: StaffFilter): Observable<{ data: Staff[]; pagination: any }> {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.department) params = params.set('department', filter.department);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.employmentType) params = params.set('employmentType', filter.employmentType);
    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);

    return this.http.get<{ data: Staff[]; pagination: any }>(this.apiUrl, { params });
  }

  getStaffById(id: number): Observable<{ success: boolean; data: Staff }> {
    return this.http.get<{ success: boolean; data: Staff }>(`${this.apiUrl}/${id}`);
  }

  createStaff(staffData: any): Observable<{ success: boolean; data: Staff }> {
    return this.http.post<{ success: boolean; data: Staff }>(this.apiUrl+'/create', staffData);
  }

  updateStaff(id: number, staffData: any): Observable<{ success: boolean; data: Staff }> {
    return this.http.put<{ success: boolean; data: Staff }>(`${this.apiUrl}/${id}`, staffData);
  }

  deleteStaff(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  getStaffStats(): Observable<{ success: boolean; data: StaffStats }> {
    return this.http.get<{ success: boolean; data: StaffStats }>(`${this.apiUrl}/stats`);
  }

  getCurrentStatus(): Observable<StaffCurrentStatusDto> {
  return this.http.get<StaffCurrentStatusDto>(`${this.apiUrl}/current-status`);
}

//
  // Shift Management
  // getShifts(): Observable<{ success: boolean; data: Shift[] }> {
  //   return this.http.get<{ success: boolean; data: Shift[] }>(`${this.apiUrl}/shifts`);
  // }

  // getShiftAssignments(staffId: number, startDate: Date, endDate: Date): Observable<{ success: boolean; data: ShiftAssignment[] }> {
  //   const params = new HttpParams()
  //     .set('startDate', startDate.toISOString())
  //     .set('endDate', endDate.toISOString());

  //   return this.http.get<{ success: boolean; data: ShiftAssignment[] }>(`${this.apiUrl}/${staffId}/shifts`, { params });
  // }

 exportAttendanceReport(startDate: Date, endDate: Date): Observable<Blob> {
  const params = new HttpParams()
    .set('startDate', startDate.toISOString())
    .set('endDate', endDate.toISOString());

  return this.http.get(`${this.apiUrl}/attendance/export`, {
    params,
    responseType: 'blob'
  });
}

  // Attendance
  getAttendance(staffId: number, startDate: Date, endDate: Date): Observable<{ success: boolean; data: AttendanceLog[] }> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get<{ success: boolean; data: AttendanceLog[] }>(`${this.apiUrl}/${staffId}/attendance`, { params });
  }

  clockIn(request: ClockInRequest): Observable<{ success: boolean; message: string; logId?: number }> {
    return this.http.post<{ success: boolean; message: string; logId?: number }>(
      `${this.apiUrl}/attendance/clock-in`,
      request
    );
  }

  // POST /staff/clock-out
  clockOut(request: ClockOutRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/attendance/clock-out`,
      request
    );
  }
StaffClockIn(staffId:number, method:string): Observable<{ success: boolean; message: string; logId?: number }> {
    return this.http.post<{ success: boolean; message: string; logId?: number }>(
      `${this.apiUrl}/clock-in`,
      {staffId,method}
    );
  }
  StaffClockOut(request: number): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/clock-out`,
    {request}
    );
  }

  // Leave Management
  getLeaveRequests(staffId?: number, status?: string): Observable<{ success: boolean; data: LeaveRequest[] }> {
    let params = new HttpParams();
    if (staffId) params = params.set('staffId', staffId.toString());
    if (status) params = params.set('status', status);

    return this.http.get<{ success: boolean; data: LeaveRequest[] }>(`${this.apiUrl}/leave`, { params });
  }

  getLeaveBalance(staffId: number, year: number): Observable<{ success: boolean; data: LeaveBalance[] }> {
    return this.http.get<{ success: boolean; data: LeaveBalance[] }>(`${this.apiUrl}/${staffId}/leave-balance/${year}`);
  }

  requestLeave(leaveData: any): Observable<{ success: boolean; data: LeaveRequest }> {
    return this.http.post<{ success: boolean; data: LeaveRequest }>(`${this.apiUrl}/leaves/request`, leaveData);
  }

  approveLeave(leaveId: number, comments?: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/leaves/${leaveId}/approve`, { comments });
  }

  rejectLeave(leaveId: number, reason: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/leaves/${leaveId}/reject`, { reason });
  }

  // Add to src/app/core/services/staff.service.ts

// Performance Management
getMyPerformanceReviews(staffId?: number, status?: string): Observable<{ success: boolean; data: PerformanceReview[] }> {
  let params = new HttpParams();
  if (staffId) params = params.set('staffId', staffId.toString());
  if (status) params = params.set('status', status);

  return this.http.get<{ success: boolean; data: PerformanceReview[] }>(`${this.apiUrl}/myPerformance/reviews`, { params });
}
getPerformanceReviews(staffId?: number, status?: string): Observable<{ success: boolean; data: PerformanceReview[] }> {
  // let params = new HttpParams();
  // if (staffId) params = params.set('staffId', staffId.toString());
  // console.log(staffId)
 // if (status) params = params.set('status', status);

  return this.http.get<{ success: boolean; data: PerformanceReview[] }>(`${this.apiUrl}/performance/reviews/${staffId}`);
}

getPerformanceReviewById(reviewId: number): Observable<{ success: boolean; data: PerformanceReview }> {
  return this.http.get<{ success: boolean; data: PerformanceReview }>(`${this.apiUrl}/performance/reviews/${reviewId}`);
}

createPerformanceReview(reviewData: CreatePerformanceReview): Observable<{ success: boolean; data: PerformanceReview }> {
  return this.http.post<{ success: boolean; data: PerformanceReview }>(`${this.apiUrl}/performance/reviews`, reviewData);
}

updatePerformanceReview(reviewId: number, reviewData: Partial<PerformanceReview>): Observable<{ success: boolean; data: PerformanceReview }> {
  return this.http.put<{ success: boolean; data: PerformanceReview }>(`${this.apiUrl}/performance/reviews/${reviewId}`, reviewData);
}

acknowledgePerformanceReview(reviewId: number, comments?: string): Observable<{ success: boolean; message: string }> {
  return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/performance/reviews/${reviewId}/acknowledge`, { comments });
}

getPerformanceDashboard(): Observable<{ success: boolean; data: PerformanceDashboard }> {
  return this.http.get<{ success: boolean; data: PerformanceDashboard }>(`${this.apiUrl}/performance/dashboard`);
}

getPerformanceMetrics(reviewId: number): Observable<{ success: boolean; data: PerformanceMetric[] }> {
  return this.http.get<{ success: boolean; data: PerformanceMetric[] }>(`${this.apiUrl}/performance/reviews/${reviewId}/metrics`);
}

updatePerformanceMetrics(reviewId: number, metrics: PerformanceMetric[]): Observable<{ success: boolean; message: string }> {
  return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/performance/reviews/${reviewId}/metrics`, { metrics });
}

// src/app/core/services/staff.service.ts
// Add these methods to the existing StaffService class

// Shift Management - Add these methods

/**
 * Get all shifts
 */
getShifts(): Observable<{ success: boolean; data: Shift[] }> {
  return this.http.get<{ success: boolean; data: Shift[] }>(`${this.apiUrl}/shifts`);
}

/**
 * Get shift by ID
 */
getShiftById(shiftId: number): Observable<{ success: boolean; data: Shift }> {
  return this.http.get<{ success: boolean; data: Shift }>(`${this.apiUrl}/shifts/${shiftId}`);
}

/**
 * Create new shift
 */
createShift(shiftData: any): Observable<{ success: boolean; data: Shift }> {
  return this.http.post<{ success: boolean; data: Shift }>(`${this.apiUrl}/shifts`, shiftData);
}

/**
 * Update existing shift
 */
updateShift(shiftId: number, shiftData: any): Observable<{ success: boolean; data: Shift }> {
  return this.http.put<{ success: boolean; data: Shift }>(`${this.apiUrl}/shifts/${shiftId}`, shiftData);
}

/**
 * Delete shift
 */
deleteShift(shiftId: number): Observable<{ success: boolean; message: string }> {
  return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/shifts/${shiftId}`);
}

/**
 * Get shift assignments for a staff member or date range
 */
getShiftAssignments(staffId: number, startDate: Date, endDate: Date): Observable<{ success: boolean; data: ShiftAssignment[] }> {
  let params = new HttpParams()
    .set('startDate', startDate.toISOString())
    .set('endDate', endDate.toISOString());

  if (staffId > 0) {
    params = params.set('staffId', staffId.toString());
  }

  return this.http.get<{ success: boolean; data: ShiftAssignment[] }>(`${this.apiUrl}/shifts/assignments`, { params });
}

/**
 * Assign shift to staff member
 */
assignShift(assignmentData: any): Observable<{ success: boolean; data: ShiftAssignment }> {
  return this.http.post<{ success: boolean; data: ShiftAssignment }>(`${this.apiUrl}/shifts/assign`, assignmentData);
}

/**
 * Update shift assignment
 */
updateShiftAssignment(assignmentId: number, assignmentData: any): Observable<{ success: boolean; data: ShiftAssignment }> {
  return this.http.put<{ success: boolean; data: ShiftAssignment }>(`${this.apiUrl}/shifts/assignments/${assignmentId}`, assignmentData);
}

/**
 * Cancel shift assignment
 */
cancelShiftAssignment(assignmentId: number): Observable<{ success: boolean; message: string }> {
  return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/shifts/assignments/${assignmentId}`);
}

/**
 * Get shift assignments by staff ID
 */
getStaffShiftAssignments(staffId: number, startDate: Date, endDate: Date): Observable<{ success: boolean; data: ShiftAssignment[] }> {
  const params = new HttpParams()
    .set('startDate', startDate.toISOString())
    .set('endDate', endDate.toISOString());

  return this.http.get<{ success: boolean; data: ShiftAssignment[] }>(`${this.apiUrl}/shifts/staff/${staffId}`, { params });
}
}
