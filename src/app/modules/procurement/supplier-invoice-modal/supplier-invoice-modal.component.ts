import { Component, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProcurementService } from '../../../core/services/procurement.service';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-supplier-invoice-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './supplier-invoice-modal.component.html',
  styleUrls: ['./supplier-invoice-modal.component.scss']
})
export class SupplierInvoiceModalComponent implements OnInit {
  @Output() close = new EventEmitter<boolean>();
  private fb = inject(FormBuilder);
  private procurementService = inject(ProcurementService);
  invoiceForm!: FormGroup;
  submitting = false;
invoiceNumber = '';
  generatingNumber = false;
   supplierName: string = '';
  poNotFound = false;
cdr = inject(ChangeDetectorRef);
  ngOnInit() {
     this.generateInvoiceNumber();
this.initForm();
this.setupPoNumberListener();
  }

  private setupPoNumberListener(): void {
    this.invoiceForm.get('poNumber')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(poNumber => {
          if (!poNumber) {
            this.supplierName = '';
            this.poNotFound = false;
            return of(null);
          }
          return this.procurementService.getPurchaseOrder(poNumber).pipe(
            catchError(() => {
              this.poNotFound = true;
              this.supplierName = '';
              return of(null);
            })
          );
        })
      )
      .subscribe(po => {
      //  console.log('PO lookup result:', po);
        if (po) {
          this.supplierName = po.supplierName;
          this.poNotFound = false;
          this.invoiceForm.patchValue({
             subTotal: po.totalAmount || 0,
              taxAmount: (po.totalAmount || 0) * 0.1, // Example: 10% tax
invoiceDate: new Date().toISOString().split('T')[0], // Default to today
dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default to +7 days


             });

          this.updateTotal();
          this.cdr.detectChanges();
        } else if (this.invoiceForm.get('poNumber')?.value) {
          this.poNotFound = true;
           this.cdr.detectChanges();
        }
      });
  }

initForm() {
    this.invoiceForm = this.fb.group({
        poNumber: ['', Validators.required],
        invoiceNumber: ['', Validators.required],
        invoiceDate: ['', Validators.required],
        dueDate: ['', Validators.required],
        subTotal: [0, [Validators.required, Validators.min(0)]],
        taxAmount: [0, [Validators.required, Validators.min(0)]],
        totalAmount: [{ value: 0, disabled: true }],
        notes: ['']
      });

    // Auto-calculate total amount when subTotal or taxAmount changes
    this.invoiceForm.get('subTotal')?.valueChanges.subscribe(() => this.updateTotal());
    this.invoiceForm.get('taxAmount')?.valueChanges.subscribe(() => this.updateTotal());
  }

   generateInvoiceNumber() {
    this.generatingNumber = true;
    this.procurementService.getNextInvoiceNumber().subscribe({
      next: (num) => {
       // console.log('Generated invoice number:', num);
        this.invoiceNumber = num.invoiceNumber || num; // Handle both string and object response
        this.invoiceForm.patchValue({ invoiceNumber: this.invoiceNumber });
        this.generatingNumber = false;
      },
      error: (err) => {
        console.error(err);
        this.generatingNumber = false;
        // Fallback: generate client-side temporary number
        const fallback = 'TMP-' + Date.now();
        this.invoiceNumber = fallback;
        this.invoiceForm.patchValue({ invoiceNumber: fallback });
      }
    });
  }

  updateTotal() {
    const subTotal = this.invoiceForm.get('subTotal')?.value || 0;
    const tax = this.invoiceForm.get('taxAmount')?.value || 0;
    this.invoiceForm.get('totalAmount')?.setValue(subTotal + tax);
  }

  submit() {
    if (this.invoiceForm.invalid) return;
    this.submitting = true;
    const formValue = this.invoiceForm.getRawValue(); // includes disabled totalAmount
    this.procurementService.createSupplierInvoice(formValue).subscribe({
      next: () => {
        this.submitting = false;
        this.close.emit(true);
      },
      error: (err) => {
        console.error(err);
        this.submitting = false;
        alert('Failed to create invoice');
      }
    });
  }

  cancel() {
    this.close.emit(false);
  }
}
