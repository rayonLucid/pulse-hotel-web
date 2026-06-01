// src/app/modules/procurement/supplier-payments-list/supplier-payments-list.component.ts
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProcurementService } from '../../../core/services/procurement.service';


interface SupplierPayment {
  supplierPaymentId: number;
  supplierInvoiceId: number;
  invoiceNumber: string;
  supplierName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  referenceNumber: string;
}

@Component({
  selector: 'app-supplier-payments-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './supplier-payments-list.component.html',
  styleUrls: ['./supplier-payments-list.component.scss']
})
export class SupplierPaymentsListComponent implements OnInit {
  private procurementService = inject(ProcurementService);
  payments: SupplierPayment[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  supplierFilter = '';
  startDate = '';
  endDate = '';
cdr =inject(ChangeDetectorRef)
  ngOnInit() { this.loadPayments(); }

  loadPayments() {
    this.loading = true;
    this.procurementService.getSupplierPayments(this.supplierFilter, this.startDate, this.endDate).subscribe({
      next: (data) => { this.payments = data; this.totalItems = data.length;
         this.loading = false;  this.cdr.detectChanges()},
      error: (err) => { console.error(err);
         this.loading = false;
         this.cdr.detectChanges()}
    });
  }

  applyFilters() { this.currentPage = 1; this.loadPayments(); }
  refresh() { this.applyFilters(); }
  pageChanged(page: number) { this.currentPage = page; }
}
