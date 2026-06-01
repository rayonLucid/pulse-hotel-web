export interface SupplierInvoice {
  supplierInvoiceId: number;
  poNumber: string;
  supplierId: number;
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: string;
  createdAt: string;
}

export interface SupplierPaymentRequest {
  supplierInvoiceId: number;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
}

export interface APAgingItem {
  supplierId: number;
  supplierName: string;
  current: number;
  days1_30: number;
  days31_60: number;
  days61_90: number;
  days90Plus: number;
  totalOutstanding: number;
}

export interface ExpenseReportItem {
  period: string;      // e.g., "2025-01"
  totalExpenses: number;
}

export interface SupplierPayment {
  supplierPaymentId: number;
  supplierInvoiceId: number;
  invoiceNumber: string;
  supplierName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  referenceNumber: string;
}
