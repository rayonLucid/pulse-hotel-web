// src/app/modules/dashboard/dashboard.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component/dashboard.component';
import { FrontDeskDashboardComponent } from './frontdesk-dashboard/frontdesk-dashboard.component';



export const DASHBOARD_ROUTES: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'admin', component: DashboardComponent },
  { path: 'manager', component: DashboardComponent },
  { path: 'frontDesk', component: FrontDeskDashboardComponent }
];
