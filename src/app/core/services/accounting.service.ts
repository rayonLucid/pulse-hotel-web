// services/accounting.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from './app.config.service';

export interface GuestInvoice {
  invoiceId: number;
  invoiceNumber: string;
  bookingId: number;
  bookingReference: string;
  guestName: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: string; // Unpaid, PartiallyPaid, Paid, Overdue
}

export interface GuestPaymentRequest {
  bookingId: number;
  amount: number;
  paymentMethod: string;
  paystackReference?: string;
  paymentGateway?: string;
  authorizationCode?: string;
  cardType?: string;
  lastFourDigits?: string;
  paystackResponse?: string;
}

export interface FinancialDashboard {
  todayRevenue: number;
  pendingPayments: number;
  monthlyTrend: { year: number; month: number; total: number }[];
  dueSupplierInvoices: SupplierInvoiceDto[];
  recentPayments: {
    paymentId: number;
    amount: number;
    paymentMethod: string;
    paymentDate: string;
    invoiceNumber: string;
    guestName: string;
  }[];
}

export interface SupplierInvoiceDto {
  supplierInvoiceId: number;
  pONumber: string;
  supplierId: number;
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: Date;
  daysOverdue : number;
  amountDue: number;
  dueDate: Date;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: string;
  createdAt: Date;
}

export interface RevenueReportItem {
  period: string; // "2025-01"
  totalRevenue: number;
}

export interface GuestPayment {
  paymentId: number;
  bookingId: number;
  bookingReference: string;
  guestName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  invoiceNumber: string;
}


@Injectable({ providedIn: 'root' })
export class AccountingService {
  private http = inject(HttpClient);
  private config = inject(AppConfigService);
  private apiUrl = `${this.config.apiUrl}/accounting`;

  getGuestInvoices(status?: string, startDate?: string, endDate?: string, bookingId?: number): Observable<GuestInvoice[]> {
    let params: any = {};
    console.log(status)
    if (status) params.status = status;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (bookingId) params.bookingId = bookingId;
    return this.http.get<GuestInvoice[]>(`${this.apiUrl}/invoices`, { params });
  }

  getGuestInvoiceById(id: number): Observable<GuestInvoice> {
    return this.http.get<GuestInvoice>(`${this.apiUrl}/invoices/${id}`);
  }

  recordGuestPayment(payment: GuestPaymentRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments`, payment);
  }

  getFinancialDashboard(): Observable<FinancialDashboard> {
    return this.http.get<FinancialDashboard>(`${this.apiUrl}/dashboard`);
  }

  getRevenueReport(startDate: string, endDate: string): Observable<RevenueReportItem[]> {
    return this.http.get<RevenueReportItem[]>(`${this.apiUrl}/reports/revenue`, { params: { start: startDate, end: endDate } });
  }

   getGuestPayments(guestName?: string, startDate?: string, endDate?: string): Observable<GuestPayment[]> {
    let params: any = {};
    if (guestName) params.guestName = guestName;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return this.http.get<GuestPayment[]>(`${this.apiUrl}/payments`, { params });
  }
}

