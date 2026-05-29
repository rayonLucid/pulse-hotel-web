// src/app/core/models/housekeeping.model.ts
export interface HousekeepingTask {
  taskId: number;
  roomId: number;
  roomNumber: string;
  roomType: string;
  taskType: 'Checkout' | 'Stayover' | 'DeepClean' | 'Turndown';
  priority: 'High' | 'Normal' | 'Low';
  assignedTo: number;
  assignedToName: string;
  assignedBy: number;
  assignedByName: string;
  assignedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Failed' | 'Cancelled';
  notes?: string;
  durationMinutes?: number;
}

export interface RoomStatus {
  roomId: number;
  roomNumber: string;
  roomType: string;
  floorNumber: number;
  status: 'Dirty' | 'Cleaning' | 'Clean' | 'Inspected' | 'OutOfService' | 'Available';
  assignedTo?: string;
  assignedToId?: number;
  estimatedCompletion?: Date;
  lastCleaned?: Date;
  nextCleaning?: Date;
}

export interface InspectionReport {
  inspectionId: number;
  taskId: number;
  roomId: number;
  roomNumber: string;
  inspectedBy: number;
  inspectorName: string;
  inspectionDate: Date;
  isPassed: boolean;
  score: number;
  comments: string;
  recleanRequired: boolean;
  recleanTaskId?: number;
}

export interface LostAndFoundItem {
  itemId: number;
  itemName: string;
  itemDescription: string;
  category: string;
  roomId?: number;
  roomNumber?: string;
  foundBy: number;
  foundByName: string;
  foundDate: Date;
  location: string;
  photoUrl?: string;
  isClaimed: boolean;
  claimedBy?: number;
  claimedByName?: string;
  claimedDate?: Date;
  status: 'Pending' | 'Claimed' | 'Donated' | 'Disposed';
}

export interface DashboardStats {
  dirtyRooms: number;
  cleaningInProgress: number;
  cleanRooms: number;
  inspectedRooms: number;
  outOfService: number;
  availableRooms: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedToday: number;
  averageCleaningTime: number;
  inspectionPassRate: number;
  totalRooms: number;
}

export interface TaskFilter {
  status?: string;
  priority?: string;
  assignedTo?: number;
  startDate?: Date;
  endDate?: Date;
  page: number;
  pageSize: number;
  searchTerm?: string;
}

// API Response Interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  totalCount?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// Task Completion Data
export interface TaskChecklistItem {
  id: number;
  name: string;
  completed: boolean;
  notes?: string;
}

export interface SupplyItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

export interface TaskCompletionData {
  checklist: TaskChecklistItem[];
  suppliesUsed: SupplyItem[];
  notes?: string;
  durationMinutes?: number;
}

// Staff Member
// src/app/core/models/housekeeping.model.ts - Add these interfaces

export interface RoomType {
  id: number;
  name: string;
  code: string;
  description: string;
  basePrice: number;
  capacity: number;
  bedType: string;
  amenities: string[];
}

export interface Room {
  id: number;
  roomNumber: string;
  roomTypeId: number;
  roomTypeName: string;
  floorNumber: number;
  status: string;
  description: string;
  capacity: number;
  view: string;
  isActive: boolean;
}

export interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  isAvailable: boolean;
  avatar?: string;
}
