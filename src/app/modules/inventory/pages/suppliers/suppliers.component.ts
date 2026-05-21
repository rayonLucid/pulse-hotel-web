// src/app/modules/inventory/pages/suppliers/suppliers.component.ts
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { InventoryService } from '../../../../core/services/inventory.service';
import { Supplier } from '../../../../core/models/inventory.model';

@Component({
  selector: 'app-inventory-suppliers',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  isLoading = true;
  isSaving = false;
  showSupplierModal = false;
  editingSupplier: Supplier | null = null;

  // Pagination with ngx-pagination
  currentPage = 1;
  pageSize = 6;
  totalItems = 0;
Math =Math
  // Filters
  searchTerm = '';
  statusFilter: string = 'all';

  // Supplier Form
  supplierForm: FormGroup;

  // Rating options
  ratingOptions = [1, 2, 3, 4, 5];

  // Inject ChangeDetectorRef
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private inventoryService: InventoryService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.supplierForm = this.fb.group({
      supplierName: ['', [Validators.required, Validators.minLength(3)]],
      contactPerson: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required]],
      taxNumber: [''],
      paymentTerms: [''],
      leadTimeDays: [7, [Validators.required, Validators.min(1), Validators.max(90)]],
      rating: [3]
    });
  }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.inventoryService.getSuppliers(this.statusFilter === 'active' ? true : this.statusFilter === 'inactive' ? false : undefined).subscribe({
      next: (response) => {
        if (response.success) {
          this.suppliers = response.data;
          this.applyFilters();
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        this.toastr.error('Failed to load suppliers', 'Error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.suppliers];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(supplier =>
        supplier.supplierName.toLowerCase().includes(term) ||
        supplier.contactPerson.toLowerCase().includes(term) ||
        supplier.email.toLowerCase().includes(term) ||
        supplier.phoneNumber.includes(term)
      );
    }

    this.filteredSuppliers = filtered;
    this.totalItems = this.filteredSuppliers.length;
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.applyFilters();
    this.loadSuppliers();
    this.cdr.detectChanges();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.statusFilter !== 'all');
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.detectChanges();
  }

  openCreateModal(): void {
    this.editingSupplier = null;
    this.supplierForm.reset({
      supplierName: '',
      contactPerson: '',
      phoneNumber: '',
      email: '',
      address: '',
      taxNumber: '',
      paymentTerms: '',
      leadTimeDays: 7,
      rating: 3
    });
    this.showSupplierModal = true;
    this.cdr.detectChanges();
  }

  openEditModal(supplier: Supplier): void {
    this.editingSupplier = supplier;
    this.supplierForm.patchValue({
      supplierName: supplier.supplierName,
      contactPerson: supplier.contactPerson,
      phoneNumber: supplier.phoneNumber,
      email: supplier.email,
      address: supplier.address,
      taxNumber: supplier.taxNumber || '',
      paymentTerms: supplier.paymentTerms || '',
      leadTimeDays: supplier.leadTimeDays,
      rating: supplier.rating || 3
    });
    this.showSupplierModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showSupplierModal = false;
    this.editingSupplier = null;
    this.cdr.detectChanges();
  }

  saveSupplier(): void {
    if (this.supplierForm.invalid) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    this.isSaving = true;
    this.cdr.detectChanges();
    const supplierData = this.supplierForm.value;

    if (this.editingSupplier) {
      this.inventoryService.updateSupplier(this.editingSupplier.supplierId, supplierData).subscribe({
        next: (response:any) => {
          this.isSaving = false;
          if (response.success) {
            this.toastr.success('Supplier updated successfully', 'Success');
            this.closeModal();
            this.loadSuppliers();
          } else {
            this.toastr.error(response.error.message || 'Update failed', 'Error');
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isSaving = false;
          this.toastr.error(error.message || 'Failed to update supplier', 'Error');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.inventoryService.createSupplier(supplierData).subscribe({
        next: (response:any) => {
          this.isSaving = false;
          if (response.success) {
            this.toastr.success('Supplier created successfully', 'Success');
            this.closeModal();
            this.loadSuppliers();
          } else {
            this.toastr.error(response.message || 'Creation failed', 'Error');
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isSaving = false;
          this.toastr.error(error.message || 'Failed to create supplier', 'Error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteSupplier(supplier: Supplier): void {
    if (confirm(`Are you sure you want to delete ${supplier.supplierName}?`)) {
      this.inventoryService.deleteSupplier(supplier.supplierId).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success('Supplier deleted successfully', 'Success');
            this.loadSuppliers();
          } else {
            this.toastr.error(response.message || 'Delete failed', 'Error');
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.toastr.error(error.message || 'Failed to delete supplier', 'Error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  toggleSupplierStatus(supplier: Supplier): void {
    const action = supplier.isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} ${supplier.supplierName}?`)) {
      const updatedData = { ...supplier, isActive: !supplier.isActive };
      this.inventoryService.updateSupplier(supplier.supplierId, updatedData).subscribe({
        next: (response:any) => {
          if (response.success) {
            this.toastr.success(`Supplier ${action}d successfully`, 'Success');
            this.loadSuppliers();
          } else {
            this.toastr.error(response.message || 'Status update failed', 'Error');
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.toastr.error(error.message || 'Failed to update status', 'Error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getRatingStars(rating: number): string[] {
    const stars: string[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? 'fas fa-star' : 'far fa-star');
    }
    return stars;
  }

  formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    if (phone.startsWith('0') && phone.length === 11) {
      return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
    }
    return phone;
  }

  trackBySupplierId(index: number, supplier: Supplier): number {
    return supplier.supplierId;
  }
}
