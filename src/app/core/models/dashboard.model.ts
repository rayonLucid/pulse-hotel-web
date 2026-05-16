// src/app/modules/dashboard/interfaces/dashboard.interface.ts
export interface DashboardData {
  roomStats: {
    totalRooms: number;
    availableRooms: number;
    occupiedRooms: number;
    maintenanceRooms: number;
    cleaningRooms: number;
    reservedRooms: number;
    occupancyRate: number;
  };
  bookingStats: {
    totalBookings: number;
    confirmedBookings: number;
    todayCheckIns: number;
    todayCheckOuts: number;
    pendingBookings: number;
    totalRevenue: number;
    dailyRevenue: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
  };
  recentBookings: Array<{
    bookingId: number;
    status: string;
    checkInDate: Date;
    checkOutDate: Date;
    guestName: string;
    roomNumber: string;
    totalAmount: number;
  }>;
  upcomingCheckouts: Array<{
    bookingId: number;
    guestName: string;
    roomNumber: string;
    checkOutDate: Date;
  }>;
  staffOnDuty: Array<{
    staffId: number;
    name: string;
    role: string;
    department: string;
    isOnline: boolean;
    shift: string;
    avatar?:string
  }>;
  housekeepingStats: {
    dirtyRooms: number;
    cleaningInProgress: number;
    cleanRooms: number;
    inspectedRooms: number;
  };
}

export interface DashboardApiResponse {
  success: boolean;
  data: DashboardData;
  message?: string;
}
