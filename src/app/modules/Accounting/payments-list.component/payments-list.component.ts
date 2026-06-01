// src/app/modules/accounting/payments-list/payments-list.component.ts
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { AccountingService } from '../../../core/services/accounting.service';


interface GuestPayment {
  paymentId: number;
  bookingId: number;
  bookingReference: string;
  guestName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  invoiceNumber: string;
}

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './payments-list.component.html',
  styleUrls: ['./payments-list.component.scss']
})
export class PaymentsListComponent implements OnInit {
  private accountingService = inject(AccountingService);
  payments: GuestPayment[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  guestFilter = '';
  startDate = '';
  endDate = '';
cdr =inject(ChangeDetectorRef)
  ngOnInit() { this.loadPayments(); }

  loadPayments() {
    this.loading = true;
    this.guestFilter =this.guestFilter.length ==0?"None":this.guestFilter
    this.accountingService.getGuestPayments(this.guestFilter, this.startDate, this.endDate).subscribe({
      next: (data) => { this.payments = data;
         this.totalItems = data.length;
          this.loading = false;
 this.cdr.detectChanges()

      },
      error: (err) => {
         console.error(err);
         this.loading = false;
         this.cdr.detectChanges()
         this.loadPayments()
       }
    });
  }

  applyFilters() { this.currentPage = 1; this.loadPayments(); }
  refresh() { this.applyFilters(); }
  pageChanged(page: number) { this.currentPage = page; }
}
