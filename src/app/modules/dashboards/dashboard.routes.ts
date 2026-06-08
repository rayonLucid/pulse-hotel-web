// src/app/modules/dashboard/dashboard.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component/dashboard.component';
import { FrontDeskDashboardComponent } from './frontdesk-dashboard/frontdesk-dashboard.component';
import { AccountingDashboardComponent } from '../Accounting/accounting-dashboard/accounting-dashboard.component';
import {HouseKeepingDashboardComponent} from '../housekeeping/pages/dashboard/dashboard.component'
import { GuestDashboardComponent } from '../guest/guest-dashboard/guest-dashboard.component';



export const DASHBOARD_ROUTES: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'admin', component: DashboardComponent },
  { path: 'guest', component: GuestDashboardComponent },
  { path: 'frontDesk', component: FrontDeskDashboardComponent },
  { path: 'accounting', component: AccountingDashboardComponent, data: { title: 'Accounting Dashboard' } },
   { path: 'housekeeping', component: HouseKeepingDashboardComponent },
];
