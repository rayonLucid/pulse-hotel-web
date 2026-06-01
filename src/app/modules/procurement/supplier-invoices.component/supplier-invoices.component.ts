import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SupplierInvoice } from '../../../core/models/procurement';
import { ProcurementService } from '../../../core/services/procurement.service';
import { PaymentModalComponent } from '../payment-modal.component/payment-modal.component';


@Component({
  selector: 'app-supplier-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, PaymentModalComponent],
  templateUrl: './supplier-invoices.component.html',
  styleUrls: ['./supplier-invoices.component.scss']
})
export class SupplierInvoicesComponent implements OnInit {
  private procurementService = inject(ProcurementService);

  invoices: SupplierInvoice[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  poNumberFilter = '';
  statusFilter = '';
  startDate = '';
  endDate = '';

  showPaymentModal = false;
  selectedInvoice: SupplierInvoice | null = null;
cdr =inject(ChangeDetectorRef)
  ngOnInit() { this.loadInvoices(); }

  loadInvoices() {
    this.loading = true;
    this.procurementService.getSupplierInvoices(
      this.statusFilter || undefined,
      this.poNumberFilter || undefined,
      this.startDate || undefined,
      this.endDate || undefined
    ).subscribe({
      next: (data) => { this.invoices = data; this.totalItems = data.length;
         this.loading = false;
         this.cdr.detectChanges() },
      error: (err) => { console.error(err); this.loading = false;
        this.cdr.detectChanges()
       }
    });
  }

  applyFilters() { this.currentPage = 1; this.loadInvoices(); }
  refresh() { this.applyFilters(); }
  pageChanged(page: number) { this.currentPage = page; }

  openPaymentModal(inv: SupplierInvoice) {
    this.selectedInvoice = inv;
    this.showPaymentModal = true;
  }

  onPaymentModalClose(refresh: boolean) {
    this.showPaymentModal = false;
    if (refresh) this.loadInvoices();
  }
}
