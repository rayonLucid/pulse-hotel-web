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


// export interface DashboardData {
//   todayCheckIns: any[];
//   todayCheckOuts: any[];
//   roomOccupancy: {
//     availableRooms: number;
//     occupiedRooms: number;
//     maintenanceRooms: number;
//     cleaningRooms: number;
//     reservedRooms: number;
//     totalRooms: number;
//   };
//   upcomingReservations: any[];
//   recentActivities: any[];
// }


// dashboard.interface.ts
export interface CheckInOutItem {
  bookingId: number;
  bookingReference: string;
  guestName: string;
  roomNumber: string;
  checkDate: string;    // ISO date string
  totalAmount: number;
}

export interface RoomOccupancy {
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  cleaningRooms: number;
  reservedRooms: number;
  totalRooms: number;
}

export interface UpcomingReservation {
  bookingId: number;
  bookingReference: string;
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  bookingStatus: string;
}

export interface RecentActivity {
  bookingId: number;
  bookingReference: string;
  guestName: string;
  roomNumber: string;
  createdAt: string;
  bookingStatus: string;
}

export interface DashboardData {
  todayCheckIns: CheckInOutItem[];
  todayCheckOuts: CheckInOutItem[];
  roomOccupancy: RoomOccupancy;
  upcomingReservations: UpcomingReservation[];
  recentActivities: RecentActivity[];
}
