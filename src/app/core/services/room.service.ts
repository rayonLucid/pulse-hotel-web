// src/app/core/services/room.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoomFilter, Room, RoomStatus, RoomType } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) {}



  // Get all rooms with filters
  // getRooms(filter: RoomFilter): Observable<{ data: Room[]; pagination: any }> {
  //   let params = new HttpParams()
  //     .set('page', filter.page.toString())
  //     .set('pageSize', filter.pageSize.toString());

  //   if (filter.status) params = params.set('status', filter.status);
  //   if (filter.roomType) params = params.set('roomType', filter.roomType);
  //   if (filter.floor) params = params.set('floor', filter.floor.toString());
  //   if (filter.minPrice) params = params.set('minPrice', filter.minPrice.toString());
  //   if (filter.maxPrice) params = params.set('maxPrice', filter.maxPrice.toString());

  //   return this.http.get<{ data: Room[]; pagination: any }>(this.apiUrl, { params });
  // }

  // Get room by ID
  getRoomById(id: number): Observable<{ success: boolean; data: Room }> {
    return this.http.get<{ success: boolean; data: Room }>(`${this.apiUrl}/${id}`);
  }

  // Get all room statuses
  getRoomStatuses(): Observable<{ success: boolean; data: RoomStatus[] }> {
    return this.http.get<{ success: boolean; data: RoomStatus[] }>(`${this.apiUrl}/status`);
  }

  // Update room status
  updateRoomStatus(roomId: number, status: string, notes?: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/${roomId}/status`, { status, notes });
  }

  // Get room types
  getRoomTypes(): Observable<{ success: boolean; data: RoomType[] }> {
    return this.http.get<{ success: boolean; data: RoomType[] }>(`${this.apiUrl}/types`);
  }


  checkAvailability(criteria: any): Observable<{ success: boolean; data: any[] }> {
    return this.http.post<{ success: boolean; data: any[] }>(`${this.apiUrl}/availability`, criteria);
  }

   // Get available rooms for date range
  getAvailableRooms(checkIn: Date, checkOut: Date, adults: number, children: number): Observable<{ success: boolean; data: Room[] }> {
    const params = new HttpParams()
      .set('checkIn', checkIn.toISOString())
      .set('checkOut', checkOut.toISOString())
      .set('adults', adults.toString())
      .set('children', children.toString());

    return this.http.get<{ success: boolean; data: Room[] }>(`${this.apiUrl}/available`, { params });
  }

   // Create new room (Admin only)
  createRoom(roomData: Partial<Room>): Observable<{ success: boolean; data: Room }> {
    return this.http.post<{ success: boolean; data: Room }>(this.apiUrl, roomData);
  }

  // Update room (Admin only)
  updateRoom(id: number, roomData: Partial<Room>): Observable<{ success: boolean; data: Room }> {
    return this.http.put<{ success: boolean; data: Room }>(`${this.apiUrl}/${id}`, roomData);
  }

  // Delete room (Admin only)
  deleteRoom(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  // Get room statistics
  getRoomStatistics(): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/statistics`);
  }



  getRooms(filter: RoomFilter): Observable<{ data: Room[]; pagination: any }> {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.status) params = params.set('status', filter.status);
    if (filter.roomType) params = params.set('roomType', filter.roomType);
    if (filter.floor) params = params.set('floor', filter.floor.toString());
    if (filter.minPrice) params = params.set('minPrice', filter.minPrice.toString());
    if (filter.maxPrice) params = params.set('maxPrice', filter.maxPrice.toString());
    if (filter.bedType) params = params.set('bedType', filter.bedType);
    if (filter.viewType) params = params.set('viewType', filter.viewType);
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);

    return this.http.get<{ data: Room[]; pagination: any }>(this.apiUrl, { params });
  }

  // Add these methods to RoomService

// Get all room types
// getRoomTypes(): Observable<{ success: boolean; data: RoomType[] }> {
//   return this.http.get<{ success: boolean; data: RoomType[] }>(`${this.apiUrl}/types`);
// }

// Create new room type
createRoomType(roomTypeData: Partial<RoomType>): Observable<{ success: boolean; data: RoomType }> {
  return this.http.post<{ success: boolean; data: RoomType }>(`${this.apiUrl}/types`, roomTypeData);
}

// Update room type
updateRoomType(id: number, roomTypeData: Partial<RoomType>): Observable<{ success: boolean; data: RoomType }> {
  return this.http.put<{ success: boolean; data: RoomType }>(`${this.apiUrl}/types/${id}`, roomTypeData);
}

// Delete room type
deleteRoomType(id: number): Observable<{ success: boolean; message: string }> {
  return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/types/${id}`);
}

}
