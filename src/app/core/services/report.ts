// src/app/core/services/report.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from './app.config.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = ``;

  constructor(private http: HttpClient,private config:AppConfigService) {
     this.apiUrl = `${this.config.apiUrl}/reports`;
  }

  // Occupancy Reports
  getOccupancyForecast(daysAhead: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/occupancy/forecast?daysAhead=${daysAhead}`);
  }

  getOccupancyDetails(startDate: Date, endDate: Date): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get(`${this.apiUrl}/occupancy/details`, { params });
  }

  // Revenue Reports
  getRevenueByRoomType(startDate: Date, endDate: Date): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get(`${this.apiUrl}/revenue/by-room-type`, { params });
  }

  getRevenueBySource(startDate: Date, endDate: Date): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get(`${this.apiUrl}/revenue/by-source`, { params });
  }

  getDailyRevenueReport(startDate: Date, endDate: Date): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get(`${this.apiUrl}/revenue/daily`, { params });
  }

  // Guest Reports
  getGuestDemographics(startDate: Date, endDate: Date): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get(`${this.apiUrl}/guest/demographics`, { params });
  }

  getGuestRetentionReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/guest/retention`);
  }

  getGuestLoyaltyReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/guest/loyalty`);
  }

  // Staff Reports
  getStaffPerformanceReport(startDate: Date, endDate: Date): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get(`${this.apiUrl}/staff/performance`, { params });
  }

  getStaffAttendanceReport(startDate: Date, endDate: Date): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get(`${this.apiUrl}/staff/attendance`, { params });
  }

  getStaffProductivityReport(startDate: Date, endDate: Date): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get(`${this.apiUrl}/staff/productivity`, { params });
  }

  // Cancellation Reports
  getCancellationAnalysis(startDate: Date, endDate: Date): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get(`${this.apiUrl}/cancellation/analysis`, { params });
  }

  getCancellationForecast(daysAhead: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/cancellation/forecast?daysAhead=${daysAhead}`);
  }

  // Forecasting Reports
  getDemandForecast(monthsAhead: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/forecast/demand?monthsAhead=${monthsAhead}`);
  }

  getRevenueForecast(monthsAhead: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/forecast/revenue?monthsAhead=${monthsAhead}`);
  }

  getOccupancyForecastMonths(monthsAhead: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/forecast/occupancy?monthsAhead=${monthsAhead}`);
  }

  // Competitive Reports
  getCompetitorRateComparison(): Observable<any> {
    return this.http.get(`${this.apiUrl}/competitor/rates`);
  }

  getMarketShareAnalysis(): Observable<any> {
    return this.http.get(`${this.apiUrl}/competitor/market-share`);
  }

  // Executive Reports
  getExecutiveSummary(startDate: Date, endDate: Date): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get(`${this.apiUrl}/executive/summary`, { params });
  }

  getFinancialReport(startDate: Date, endDate: Date): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get(`${this.apiUrl}/financial`, { params });
  }

  // Dashboard Summary
  getDashboardSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard-summary`);
  }
}
