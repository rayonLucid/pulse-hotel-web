import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { AccountingService, GuestInvoice } from '../../../core/services/accounting.service';
import { PaymentModalComponent } from '../payment-modal.component/payment-modal.component';



@Component({
  selector: 'app-guest-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, PaymentModalComponent],
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class GuestInvoicesComponent implements OnInit {
  private accountingService = inject(AccountingService);
  invoices: GuestInvoice[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  statusFilter = '';
  startDate = '';
  endDate = '';

  showPaymentModal = false;
  selectedInvoice: GuestInvoice | null = null;
cdr =inject(ChangeDetectorRef)
  ngOnInit() { this.loadInvoices(); }

  loadInvoices() {
    this.loading = true;
    this.accountingService.getGuestInvoices(
      this.statusFilter || "All",
      this.startDate || formatDate(new Date(),"yyyy-MM-dd","en"),
      this.endDate ||  formatDate(new Date(),"yyyy-MM-dd","en")
    ).subscribe({
      next: (data) => {
         this.invoices = data;
         this.totalItems = data.length;
         this.loading = false;
          this.cdr.detectChanges()
         },
      error: (err) => {
        console.error(err); this.loading = false;
   this.cdr.detectChanges()
   this. loadInvoices()

      }
    });
  }

  applyFilters() { this.currentPage = 1; this.loadInvoices(); }
  refresh() { this.applyFilters(); }
  pageChanged(page: number) { this.currentPage = page; }

  openPaymentModal(inv: GuestInvoice) {
    this.selectedInvoice = inv;
    this.showPaymentModal = true;
  }

  onPaymentModalClose(refresh: boolean) {
    this.showPaymentModal = false;
    if (refresh) this.loadInvoices();
  }
}
