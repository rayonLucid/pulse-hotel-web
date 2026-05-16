// src/app/core/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardApiResponse } from '../models/dashboard.model';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  // getDashboardData(): Observable<DashboardData> {
  //   return this.http.get<DashboardData>(`${this.apiUrl}/data`);
  // }
  getDashboardData(): Observable<DashboardApiResponse> {
    return this.http.get<DashboardApiResponse>(`${this.apiUrl}/data`);
  }
}
