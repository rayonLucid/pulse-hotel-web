import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GuestInvoice, AccountingService } from '../../../core/services/accounting.service';


@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss']
})
export class PaymentModalComponent {
  @Input() invoice: GuestInvoice | null = null;
  @Output() close = new EventEmitter<boolean>();
  private fb = inject(FormBuilder);
  private accountingService = inject(AccountingService);
  paymentForm: FormGroup;
  submitting = false;

  constructor() {
    this.paymentForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01), Validators.max(this.invoice?.balanceDue || 0)]],
      paymentMethod: ['Cash', Validators.required],
      referenceNumber: ['']
    });
  }

  closeModal() { this.close.emit(false); }

  submitPayment() {
    if (!this.invoice) return;
    this.submitting = true;
    const payload = {
      bookingId: this.invoice.bookingId,
      amount: this.paymentForm.value.amount,
      paymentMethod: this.paymentForm.value.paymentMethod,
      paystackReference: this.paymentForm.value.referenceNumber,
      paymentGateway: 'Manual',
      authorizationCode: '',
      cardType: '',
      lastFourDigits: '',
      paystackResponse: ''
    };
    this.accountingService.recordGuestPayment(payload).subscribe({
      next: () => { this.submitting = false; this.close.emit(true); },
      error: (err) => { console.error(err); this.submitting = false; alert('Payment failed'); }
    });
  }
}
