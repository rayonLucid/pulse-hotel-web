// services/procurement.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from './app.config.service';
import { SupplierInvoice, SupplierPaymentRequest, APAgingItem, ExpenseReportItem, SupplierPayment } from '../models/procurement';


@Injectable({ providedIn: 'root' })
export class ProcurementService {
  private http = inject(HttpClient);
  private config = inject(AppConfigService);
  private apiUrl = `${this.config.apiUrl}/procurement`;

  getSupplierInvoices(status?: string, poNumber?: string, start?: string, end?: string): Observable<SupplierInvoice[]> {
    let params: any = {};
    if (status) params.status = status;
    if (poNumber) params.poNumber = poNumber;
    if (start) params.start = start;
    if (end) params.end = end;
    return this.http.get<SupplierInvoice[]>(`${this.apiUrl}/invoices`, { params });
  }
// services/procurement.service.ts
getExpenseReport(startDate: string, endDate: string): Observable<ExpenseReportItem[]> {
  return this.http.get<ExpenseReportItem[]>(`${this.apiUrl}/reports/expenses`, { params: { start: startDate, end: endDate } });
}
  getSupplierInvoiceById(id: number): Observable<SupplierInvoice> {
    return this.http.get<SupplierInvoice>(`${this.apiUrl}/invoices/${id}`);
  }

  recordPayment(payment: SupplierPaymentRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments`, payment);
  }

  getAPAgingReport(asOfDate?: string): Observable<APAgingItem[]> {
    const params = asOfDate ? { asOfDate } : {};
    return this.http.post<APAgingItem[]>(`${this.apiUrl}/reports/aging`, { params });
  }
  // services/procurement.service.ts
getSupplierPayments(supplierName?: string, startDate?: string, endDate?: string): Observable<SupplierPayment[]> {
  let params: any = {};
  if (supplierName) params.supplierName = supplierName;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  return this.http.get<SupplierPayment[]>(`${this.apiUrl}/payments`, { params });
}
}
