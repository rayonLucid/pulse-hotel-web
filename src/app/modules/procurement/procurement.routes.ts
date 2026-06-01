// src/app/modules/procurement/procurement.routes.ts
import { Routes } from '@angular/router';
import { APAgingReportComponent } from './ap-aging-report.component/ap-aging-report.component';
import { ExpenseChartsComponent } from './expense-charts.component/expense-charts.component';
import { SupplierInvoicesComponent } from './supplier-invoices.component/supplier-invoices.component';
import { SupplierPaymentsListComponent } from './supplier-payments-list.component/supplier-payments-list.component';
import { ExpenseReportsComponent } from './expense-reports.component/expense-reports.component';


export const PROCUREMENT_ROUTES: Routes = [
  { path: '', redirectTo: 'invoices', pathMatch: 'full' },
  { path: 'invoices', component: SupplierInvoicesComponent, data: { title: 'Supplier Invoices' } },
  { path: 'aging-report', component: APAgingReportComponent, data: { title: 'AP Aging Report' } },
  { path: 'expense-charts', component: ExpenseChartsComponent, data: { title: 'Expense Charts' } },
    { path: 'payments', component: SupplierPaymentsListComponent, data: { title: 'Supplier Payments' }},
     { path: 'expense-reports', component: ExpenseReportsComponent, data: { title: 'Expense Reports' }}
];
