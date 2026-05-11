// src/app/core/services/room.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) {}

  checkAvailability(criteria: any): Observable<{ success: boolean; data: any[] }> {
    return this.http.post<{ success: boolean; data: any[] }>(`${this.apiUrl}/availability`, criteria);
  }
}
