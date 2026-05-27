// src/app/core/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { DashboardApiResponse } from '../models/dashboard.model';
import { AppConfigService } from './app.config.service';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
 // private apiUrl = `${environment.apiUrl}/dashboard`;

private rootUrl = "";
public apiUrl = '';
  constructor(private http: HttpClient,private readonly config:AppConfigService) {
this.apiUrl = `${this.config.apiUrl}/dashboard`;
this.rootUrl = this.config.rootUrl;
  }

  // getDashboardData(): Observable<DashboardData> {
  //   return this.http.get<DashboardData>(`${this.apiUrl}/data`);
  // }
  getDashboardData(): Observable<DashboardApiResponse> {
    return this.http.get<DashboardApiResponse>(`${this.apiUrl}/data`);
  }
}
