// src/app/modules/reports/reports.routes.ts
import { Routes } from '@angular/router';
import { ReportsDashboardComponent } from './pages/dashboard/reports-dashboard.component';
import { OccupancyReportsComponent } from './pages/occupancy/occupancy-reports.component';
import { RevenueReportsComponent } from './pages/revenue/revenue-reports.component';
import { StaffReportsComponent } from './pages/staff/staff-reports.component';
import { FinancialReportsComponent } from './pages/financial/financial-reports.component';
import { ExecutiveSummaryComponent } from './pages/executive/executive-summary.component';


export const REPORTS_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ReportsDashboardComponent },
  { path: 'occupancy', component: OccupancyReportsComponent },
  { path: 'revenue', component: RevenueReportsComponent },
  // { path: 'guest', component: GuestReportsComponent },
  { path: 'staff', component: StaffReportsComponent },
  { path: 'financial', component: FinancialReportsComponent },
  { path: 'executive', component: ExecutiveSummaryComponent },
  { path: '**', redirectTo: 'dashboard' }
];
