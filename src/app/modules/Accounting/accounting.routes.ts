// src/app/modules/accounting/accounting.routes.ts
import { Routes } from '@angular/router';
import { AccountingDashboardComponent } from './accounting-dashboard/accounting-dashboard.component';
import { GuestInvoicesComponent } from './invoices.component/invoices.component';
import { RevenueReportsComponent } from './revenue-reports.component/revenue-reports.component';
import { PaymentsListComponent } from './payments-list.component/payments-list.component';


export const ACCOUNTING_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AccountingDashboardComponent, data: { title: 'Accounting Dashboard' } },
  { path: 'invoices', component: GuestInvoicesComponent, data: { title: 'Guest Invoices' } },
  { path: 'reports', component: RevenueReportsComponent, data: { title: 'Revenue Reports' } },
  { path: 'payments', component: PaymentsListComponent, data: { title: 'Payments' } }
];
