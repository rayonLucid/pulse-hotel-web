
// src/app/core/models/room.model.ts

export interface Room {
  roomId: number;
  roomNumber: string;
  roomTypeId: number;
  roomType: string;
  floorNumber: number;
  status: RoomStatusType;
  pricePerNight: number;
  maxAdults: number;
  maxChildren: number;
  roomSize: number; // in square meters
  bedType: BedTypes;
  viewType: ViewTypes;
  amenities: Amenity[];
  images: string[];
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomType {
  roomTypeId: number;
  typeName: string;
  description: string;
  basePrice: number;
  peakPrice: number | null;
  maxAdults: number;
  maxChildren: number;
  roomSize: number;
  bedType: BedTypes;
  viewType: ViewTypes;
  amenities: Amenity[];
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roomCount: number;
}

export interface RoomStatus {
  roomId: number;
  roomNumber: string;
  roomType: string;
  status: RoomStatusType;
  currentGuestId?: number;
  currentGuestName?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  lastCleaned?: Date;
  nextCleaning?: Date;
  maintenanceNotes?: string;
  floorNumber: number;
}

export interface RoomFilter {
  status?: RoomStatusType;
  roomType?: string;
  floor?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  bedType?: BedTypes;
  viewType?: ViewTypes;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RoomStatistics {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  cleaningRooms: number;
  reservedRooms: number;
  occupancyRate: number;
  roomsByType: {
    roomType: string;
    count: number;
    occupied: number;
    available: number;
  }[];
  roomsByFloor: {
    floor: number;
    total: number;
    occupied: number;
    available: number;
  }[];
}

export interface RoomAvailabilityRequest {
  checkInDate: Date;
  checkOutDate: Date;
  adults: number;
  children: number;
  roomTypeId?: number;
}

export interface RoomAvailabilityResponse {
  roomId: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  isAvailable: boolean;
}

export interface CreateRoomRequest {
  roomNumber: string;
  roomTypeId: number;
  floorNumber: number;
  status?: RoomStatusType;
  notes?: string;
}

export interface UpdateRoomRequest {
  roomNumber?: string;
  roomTypeId?: number;
  floorNumber?: number;
  status?: RoomStatusType;
  notes?: string;
}

// Enums
export type RoomStatusType = 'Available' | 'Occupied' | 'Maintenance' | 'Cleaning' | 'Reserved' | 'OutOfService';

//export type BedType = 'Single' | 'Double' | 'Queen' | 'King' | 'Emperor' | 'Twin' | 'Sofa Bed';

//export type ViewType = 'City View' | 'Ocean View' | 'Pool View' | 'Garden View' | 'Mountain View' | 'Lagoon View' | 'Panoramic' | 'No View';

export interface ViewTypes {
  viewTypeId: number;
  description:string;
  viewName: string;
  premiumCharge: number;
}
// Helper functions
export const RoomStatusLabels: Record<RoomStatusType, string> = {
  'Available': 'Available',
  'Occupied': 'Occupied',
  'Maintenance': 'Under Maintenance',
  'Cleaning': 'Being Cleaned',
  'Reserved': 'Reserved',
  'OutOfService': 'Out of Service'
};

export const RoomStatusColors: Record<RoomStatusType, string> = {
  'Available': '#10b981',    // Green
  'Occupied': '#3b82f6',     // Blue
  'Maintenance': '#ef4444',  // Red
  'Cleaning': '#f59e0b',     // Amber
  'Reserved': '#8b5cf6',     // Purple
  'OutOfService': '#6b7280'  // Gray
};

export const RoomStatusBgClasses: Record<RoomStatusType, string> = {
  'Available': 'bg-green-100 text-green-700',
  'Occupied': 'bg-blue-100 text-blue-700',
  'Maintenance': 'bg-red-100 text-red-700',
  'Cleaning': 'bg-yellow-100 text-yellow-700',
  'Reserved': 'bg-purple-100 text-purple-700',
  'OutOfService': 'bg-gray-100 text-gray-700'
};

// export const BedTypeLabels: Record<BedTypes, string> = {
//   'Single': 'Single Bed',
//   'Double': 'Double Bed',
//   'Queen': 'Queen Size Bed',
//   'King': 'King Size Bed',
//   'Emperor': 'Emperor Size Bed',
//   'Twin': 'Twin Beds',
//   'Sofa Bed': 'Sofa Bed'
// };

// export const ViewTypeLabels: Record<ViewType, string> = {
//   'City View': 'City View',
//   'Ocean View': 'Ocean View',
//   'Pool View': 'Pool View',
//   'Garden View': 'Garden View',
//   'Mountain View': 'Mountain View',
//   'Lagoon View': 'Lagoon View',
//   'Panoramic': 'Panoramic View',
//   'No View': 'No View'
// };

// Utility functions
export function getRoomStatusLabel(status: RoomStatusType): string {
  return RoomStatusLabels[status] || status;
}

export function getRoomStatusColor(status: RoomStatusType): string {
  return RoomStatusColors[status] || '#6b7280';
}

export function getRoomStatusClass(status: RoomStatusType): string {
  return RoomStatusBgClasses[status] || 'bg-gray-100 text-gray-700';
}

// export function getBedTypeLabel(bedType: BedTypes): string {
//   return BedTypeLabels[bedType] || bedType;
// }

// export function getViewTypeLabel(viewType: ViewTypes): string {
//   return ViewTypeLabels[viewType] || viewType;
// }

export function formatPrice(price: number): string {
  return `₦${price.toLocaleString()}`;
}

export interface Amenity {
  amenityId?: number; // Optional because the DB generates it during POST
  amenityName: string;
  icon?: string | null;
  isActive: boolean;
  isConsumable?: boolean; // For inventory items that are used as amenities
  stockItemId?: number | null; // Link to inventory item if isConsumable is true
}


export interface BedTypes {
  bedTypeId: number;
  bedTypeName: string;
  Description: string;
  maxOccupancy: number;
}
export interface RoomWizardData {
  roomId?: number;
  roomNumber: string;
  roomTypeId: number;
  floorNumber: number;
  roomSize?: number;
  viewTypeId?: number;
  isSmoking: boolean;
  isAccessible: boolean;
  bedsJson?: string;
  amenitiesJson?: string;
  basePriceOverride?: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  status: string;
  isActive: boolean;
}
