import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupplierInvoice } from '../../../core/models/procurement';
import { ProcurementService } from '../../../core/services/procurement.service';


@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss']
})
export class PaymentModalComponent {
  @Input() invoice: SupplierInvoice | null = null;
  @Output() close = new EventEmitter<boolean>();
  private fb = inject(FormBuilder);
  private procurementService = inject(ProcurementService);

  paymentForm: FormGroup;
  submitting = false;

  constructor() {
    this.paymentForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      paymentMethod: ['BankTransfer', Validators.required],
      referenceNumber: [''],
      notes: ['']
    });
  }

  closeModal() { this.close.emit(false); }

  submitPayment() {
    if (!this.invoice) return;
    this.submitting = true;
    const payload = {
      supplierInvoiceId: this.invoice.supplierInvoiceId,
      amount: this.paymentForm.value.amount,
      paymentMethod: this.paymentForm.value.paymentMethod,
      referenceNumber: this.paymentForm.value.referenceNumber,
      notes: this.paymentForm.value.notes
    };
    this.procurementService.recordPayment(payload).subscribe({
      next: () => { this.submitting = false; this.close.emit(true); },
      error: (err) => { console.error(err); this.submitting = false; alert('Payment failed'); }
    });
  }
}
