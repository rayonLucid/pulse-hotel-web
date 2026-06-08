import { AppConfigService } from './app.config.service';
// src/app/core/services/housekeeping.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';

import {
  HousekeepingTask,
  RoomStatus,
  InspectionReport,
  LostAndFoundItem,
  DashboardStats,
  TaskFilter,
  ApiResponse,
  PaginatedResponse,
  TaskCompletionData,
  StaffMember
} from '../models/housekeeping.model';
import { Room, RoomType } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class HousekeepingService {
  private apiUrl = ``;

  constructor(private http: HttpClient,private config :AppConfigService) {
    this.apiUrl = `${this.config.apiUrl}/housekeeping`;
  }

  // ==================== TASK MANAGEMENT ====================

  /**
   * Get tasks with filtering and pagination
   */
  getTasks(filter: TaskFilter): Observable<PaginatedResponse<HousekeepingTask>> {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.status) params = params.set('status', filter.status);
    if (filter.priority) params = params.set('priority', filter.priority);
    if (filter.assignedTo) params = params.set('assignedTo', filter.assignedTo.toString());
    if (filter.startDate) params = params.set('startDate', filter.startDate.toISOString());
    if (filter.endDate) params = params.set('endDate', filter.endDate.toISOString());
    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);

    return this.http.get<PaginatedResponse<HousekeepingTask>>(`${this.apiUrl}/tasks`, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get task by ID
   */
  getTaskById(id: number): Observable<ApiResponse<HousekeepingTask>> {
    return this.http.get<ApiResponse<HousekeepingTask>>(`${this.apiUrl}/tasks/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Create new task
   */
  createTask(taskData: Partial<HousekeepingTask>): Observable<ApiResponse<HousekeepingTask>> {
    return this.http.post<ApiResponse<HousekeepingTask>>(`${this.apiUrl}/tasks`, taskData)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Start a task
   */
  startTask(taskId: number): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/tasks/${taskId}/start`, {})
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Complete a task with checklist and supplies
   */
  completeTask(taskId: number, completionData: TaskCompletionData): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/tasks/${taskId}/complete`, completionData)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Reassign task to different staff
   */
  reassignTask(taskId: number, newStaffId: number): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/tasks/${taskId}/reassign`, { newStaffId })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Cancel task with reason
   */
  cancelTask(taskId: number, reason: string): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/tasks/${taskId}/cancel`, { reason })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId: number, status: HousekeepingTask['status']): Observable<ApiResponse<string>> {
    const body = { status, updatedAt: new Date() };
    return this.http.patch<ApiResponse<string>>(`${this.apiUrl}/tasks/${taskId}/status`, body)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Update task details
   */
  updateTask(taskId: number, taskUpdate: Partial<HousekeepingTask>): Observable<ApiResponse<HousekeepingTask>> {
    return this.http.put<ApiResponse<HousekeepingTask>>(`${this.apiUrl}/tasks/${taskId}`, taskUpdate)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Delete task
   */
  deleteTask(taskId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/tasks/${taskId}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get task statistics
   */
  getTaskStatistics(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/tasks/statistics`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get tasks by staff member
   */
  getTasksByStaff(staffId: number, status?: string): Observable<PaginatedResponse<HousekeepingTask>> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);

    return this.http.get<PaginatedResponse<HousekeepingTask>>(`${this.apiUrl}/tasks/staff/${staffId}`, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Bulk assign tasks
   */
  bulkAssignTasks(taskIds: number[], staffId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/tasks/bulk-assign`, { taskIds, staffId })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get task checklist template
   */
  getTaskChecklistTemplate(taskType: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/tasks/checklist/${taskType}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // ==================== ROOM MANAGEMENT ====================

  /**
   * Get all room statuses
   */
  getAllRoomStatuses(): Observable<ApiResponse<RoomStatus[]>> {
    return this.http.get<ApiResponse<RoomStatus[]>>(`${this.apiUrl}/rooms/status`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  getRoomById(roomId: number): Observable<ApiResponse<RoomStatus>> {
  return this.http.get<ApiResponse<RoomStatus>>(`${this.apiUrl}/rooms/${roomId}`)
    .pipe(catchError(this.handleError.bind(this)));
}

  /**
   * Get room status by ID
   */
  getRoomStatus(roomId: number): Observable<ApiResponse<RoomStatus>> {
    return this.http.get<ApiResponse<RoomStatus>>(`${this.apiUrl}/rooms/${roomId}/status`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Update room status
   */
  updateRoomStatus(roomId: number, status: string, notes?: string): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/rooms/${roomId}/status`, { status, notes })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get rooms by floor
   */
  getRoomsByFloor(floorNumber: number): Observable<ApiResponse<RoomStatus[]>> {
    return this.http.get<ApiResponse<RoomStatus[]>>(`${this.apiUrl}/rooms/floor/${floorNumber}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get rooms by status
   */
  getRoomsByStatus(status: string): Observable<ApiResponse<RoomStatus[]>> {
    return this.http.get<ApiResponse<RoomStatus[]>>(`${this.apiUrl}/rooms/status/${status}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  getRoomTypes(): Observable<{ success: boolean; data: RoomType[] }> {
  return this.http.get<{ success: boolean; data: RoomType[] }>(`${this.apiUrl}/room-types`)
    .pipe(catchError(this.handleError.bind(this)));
}

/**
 * Get all rooms (for dropdown)
 */
getAllRooms(): Observable<{ success: boolean; data: Room[] }> {
  return this.http.get<{ success: boolean; data: Room[] }>(`${this.apiUrl}/rooms/list`)
    .pipe(catchError(this.handleError.bind(this)));
}

/**
 * Get room by ID with full details
 */
getRoomDetails(roomId: number): Observable<{ success: boolean; data: Room }> {
  return this.http.get<{ success: boolean; data: Room }>(`${this.apiUrl}/rooms/${roomId}`)
    .pipe(catchError(this.handleError.bind(this)));
}



  /**
   * Batch update room statuses
   */
  batchUpdateRoomStatus(roomIds: number[], status: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/rooms/batch-update`, { roomIds, status })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // ==================== INSPECTION MANAGEMENT ====================

  /**
   * Get inspections with optional task filter
   */
  getInspections(taskId?: number): Observable<ApiResponse<InspectionReport[]>> {
    let params = new HttpParams();
     console.log('Fetching inspections with params:', taskId);

    if (taskId)
      {
        params = params.set('taskId', taskId.toString());
           console.log('Fetching inspections with params:', taskId);
      }else{
       params = params.set('taskId', "0");
         console.log('Fetching inspections with params:', taskId);
      }

    return this.http.get<ApiResponse<InspectionReport[]>>(`${this.apiUrl}/tasks/${taskId}/inspections`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get recent inspections
   */
  getRecentInspections(limit: number = 5): Observable<ApiResponse<InspectionReport[]>> {
    return this.http.get<ApiResponse<InspectionReport[]>>(`${this.apiUrl}/inspections/recent?limit=${limit}`)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Create new inspection
   */
  createInspection(inspectionData: Partial<InspectionReport>): Observable<ApiResponse<InspectionReport>> {
    return this.http.post<ApiResponse<InspectionReport>>(`${this.apiUrl}/inspections`, inspectionData)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Update inspection
   */
  updateInspection(inspectionId: number, inspectionData: Partial<InspectionReport>): Observable<ApiResponse<InspectionReport>> {
    return this.http.put<ApiResponse<InspectionReport>>(`${this.apiUrl}/inspections/${inspectionId}`, inspectionData)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get inspection by ID
   */
  getInspectionById(inspectionId: number): Observable<ApiResponse<InspectionReport>> {
    return this.http.get<ApiResponse<InspectionReport>>(`${this.apiUrl}/inspections/${inspectionId}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get inspections by room
   */
  getInspectionsByRoom(roomId: number): Observable<ApiResponse<InspectionReport[]>> {
    return this.http.get<ApiResponse<InspectionReport[]>>(`${this.apiUrl}/inspections/room/${roomId}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // ==================== LOST & FOUND MANAGEMENT ====================

  /**
   * Get lost and found items with optional filters
   */
  getLostAndFoundItems(status?: string, category?: string): Observable<ApiResponse<LostAndFoundItem[]>> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (category) params = params.set('category', category);
    return this.http.get<ApiResponse<LostAndFoundItem[]>>(`${this.apiUrl}/lost-found/unclaimed`, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get lost and found item by ID
   */
  getLostAndFoundItemById(itemId: number): Observable<ApiResponse<LostAndFoundItem>> {
    return this.http.get<ApiResponse<LostAndFoundItem>>(`${this.apiUrl}/lost-found/${itemId}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Create lost and found item
   */
  createLostAndFoundItem(itemData: Partial<LostAndFoundItem>): Observable<ApiResponse<LostAndFoundItem>> {
    return this.http.post<ApiResponse<LostAndFoundItem>>(`${this.apiUrl}/lost-found`, itemData)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Update lost and found item
   */
  updateLostAndFoundItem(itemId: number, itemData: Partial<LostAndFoundItem>): Observable<ApiResponse<LostAndFoundItem>> {
    return this.http.put<ApiResponse<LostAndFoundItem>>(`${this.apiUrl}/lost-found/${itemId}`, itemData)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Claim lost and found item
   */
  claimLostAndFoundItem(itemId: number, claimedBy: number, claimedByName: string): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/lost-found/${itemId}/claim`, { claimedBy, claimedByName })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Delete lost and found item
   */
  deleteLostAndFoundItem(itemId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/lost-found/${itemId}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // ==================== DASHBOARD ====================

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/dashboard`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // ==================== STAFF MANAGEMENT ====================

  /**
   * Get all staff members
   */
  getStaffMembers(): Observable<ApiResponse<StaffMember[]>> {
    return this.http.get<ApiResponse<StaffMember[]>>(`${this.apiUrl}/staff`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get available staff for assignment
   */
  getAvailableStaff(date?: Date): Observable<ApiResponse<StaffMember[]>> {
    let params = new HttpParams();
    if (date) params = params.set('date', date.toISOString());
    return this.http.get<ApiResponse<StaffMember[]>>(`${this.apiUrl}/staff/available`, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get staff performance metrics
   */
  getStaffPerformance(staffId: number, startDate?: Date, endDate?: Date): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/staff/${staffId}/performance`, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getStaffByDepartment(department: string): Observable<{ success: boolean; data: StaffMember[] }> {
  return this.http.get<{ success: boolean; data: StaffMember[] }>(`${this.apiUrl}/staff/department/${department}`)
    .pipe(catchError(this.handleError.bind(this)));
}

/**
 * Get housekeeping staff only
 */
getHousekeepingStaff(): Observable<{ success: boolean; data: StaffMember[] }> {
  return this.http.get<{ success: boolean; data: StaffMember[] }>(`${this.apiUrl}/staff/housekeeping`)
    .pipe(catchError(this.handleError.bind(this)));
}

  // ==================== REPORTS ====================

  /**
   * Export reports
   */
  exportReport(reportType: string, startDate: Date, endDate: Date, format: 'csv' | 'pdf' = 'csv'): Observable<Blob> {
    const params = new HttpParams()
      .set('reportType', reportType)
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString())
      .set('format', format);

    return this.http.get(`${this.apiUrl}/reports/export`, {
      params,
      responseType: 'blob'
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Generate cleaning schedule
   */
  generateCleaningSchedule(startDate: Date, endDate: Date): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/schedule/cleaning`, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // ==================== ERROR HANDLER ====================

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred while processing your request';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
      console.error('Client Error:', error.error.message);
    } else {
      // Server-side error
      errorCode = error.error?.errorCode || `HTTP_${error.status}`;
      errorMessage = error.error?.message || `Server Error: ${error.status} - ${error.statusText}`;

      // Log error for debugging
      console.error('API Error Details:', {
        status: error.status,
        statusText: error.statusText,
        errorCode: errorCode,
        message: errorMessage,
        url: error.url,
        timestamp: new Date().toISOString()
      });
    }

    // Return an observable with a user-facing error message
    return throwError(() => ({
      success: false,
      errorCode: errorCode,
      message: errorMessage,
      timestamp: new Date().toISOString()
    }));
  }
}
