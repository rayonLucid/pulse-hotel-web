// leave.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from './app.config.service';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private apiUrl = ``;

  constructor(private http: HttpClient,private configService :AppConfigService) {
        this.apiUrl = `${this.configService.apiUrl}/leave`;
    }

  submitLeaveRequest(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/request`, data);
  }

  getMyRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-requests`);
  }

  getPendingRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pending`);
  }

  approveLeave(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/approve/${id}?status=${status}`, {});
  }
}
