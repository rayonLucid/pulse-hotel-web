// src/app/modules/inventory/pages/purchase-orders/purchase-orders.component.ts
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { InventoryService } from '../../../../core/services/inventory.service';
import { PurchaseOrder, Supplier, InventoryItem } from '../../../../core/models/inventory.model';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.scss']
})
export class PurchaseOrdersComponent implements OnInit {
  purchaseOrders: PurchaseOrder[] = [];
  filteredOrders: PurchaseOrder[] = [];
  suppliers: Supplier[] = [];
  items: InventoryItem[] = [];
  isLoading = true;
  isSaving = false;
  showPOModal = false;
  showReceiveModal = false;
  selectedPO: PurchaseOrder | null = null;
  editingPO: PurchaseOrder | null = null;

  // Pagination with ngx-pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
Math =Math
  // Filters
  statusFilter: string = '';
  searchTerm: string = '';

  // Purchase Order Form
  poForm: FormGroup;
  poItems: any[] = [];

  // Receive Form
  receiveForm: FormGroup;
  receiveItems: any[] = [];

  // Status options
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Submitted', label: 'Submitted' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Received', label: 'Received' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  // Available items for selection
  availableItems: any[] = [];

  // Inject ChangeDetectorRef
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private inventoryService: InventoryService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.poForm = this.fb.group({
      supplierId: ['', Validators.required],
      expectedDeliveryDate: ['', Validators.required],
      notes: ['']
    });

    this.receiveForm = this.fb.group({
      invoiceNumber: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadPurchaseOrders();
    this.loadSuppliers();
    this.loadItems();
  }

  loadPurchaseOrders(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.inventoryService.getPurchaseOrders(this.statusFilter || undefined).subscribe({
      next: (response) => {
        if (response.success) {
          this.purchaseOrders = response.data;
          this.applyFilters();
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading purchase orders:', error.error.message);
        this.toastr.error('Failed to load purchase orders', 'Error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadSuppliers(): void {
    this.inventoryService.getSuppliers(true).subscribe({
      next: (response) => {
        if (response.success) {
          this.suppliers = response.data;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
      }
    });
  }

  loadItems(): void {
    this.inventoryService.getItems({ page: 1, pageSize: 100 }).subscribe({
      next: (response:any) => {
        if (response.success) {
          this.items = response.data;
          this.availableItems = response.data.map((item:any) => ({
            itemId: item.itemId,
            itemName: item.itemName,
            itemCode: item.itemCode,
            unitOfMeasure: item.unitOfMeasure,
            unitCost: item.unitCost,
            quantityOrdered: 0,
            quantityReceived: 0
          }));
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading items:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.purchaseOrders];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(po =>
        po.poNumber.toString().includes(term) ||
        po.supplierName.toLowerCase().includes(term)
      );
    }

    this.filteredOrders = filtered;
    this.totalItems = this.filteredOrders.length;
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.searchTerm = '';
    this.loadPurchaseOrders();
    this.cdr.detectChanges();
  }

  hasActiveFilters(): boolean {
    return !!(this.statusFilter || this.searchTerm);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.detectChanges();
  }

  openCreateModal(): void {
    this.editingPO = null;
    this.poForm.reset({
      supplierId: '',
      expectedDeliveryDate: '',
      notes: ''
    });
    this.poItems = [];
    this.showPOModal = true;
    this.cdr.detectChanges();
  }

  openEditModal(po: PurchaseOrder): void {
    this.editingPO = po;
    this.poForm.patchValue({
      supplierId: po.supplierId,
      expectedDeliveryDate: new Date(po.expectedDeliveryDate).toISOString().split('T')[0],
      notes: po.notes || ''
    });
    this.poItems = po.items.map((item:any) => ({
      itemId: item.itemId,
      itemName: item.itemName,
      itemCode: item.itemCode,
      unitOfMeasure: item.unitOfMeasure,
      unitCost: item.unitCost,
      quantityOrdered: item.quantityOrdered,
      quantityReceived: item.quantityReceived
    }));
    this.showPOModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showPOModal = false;
    this.editingPO = null;
    this.cdr.detectChanges();
  }

  addItemToPO(): void {
    this.poItems.push({
      itemId: null,
      itemName: '',
      itemCode: '',
      unitOfMeasure: '',
      unitCost: 0,
      quantityOrdered: 1,
      quantityReceived: 0,
      isNew: true
    });
    this.cdr.detectChanges();
  }

  removeItemFromPO(index: number): void {
    this.poItems.splice(index, 1);
    this.cdr.detectChanges();
  }

  updateItemSelection(index: number): void {
    const selectedItem = this.items.find(i => i.itemId === this.poItems[index].itemId);
    if (selectedItem) {
      this.poItems[index].itemName = selectedItem.itemName;
      this.poItems[index].itemCode = selectedItem.itemCode;
      this.poItems[index].unitOfMeasure = selectedItem.unitOfMeasure;
      this.poItems[index].unitCost = selectedItem.unitCost;
    }
    this.cdr.detectChanges();
  }

  calculateSubtotal(): number {
    return this.poItems.reduce((sum, item) => sum + (item.quantityOrdered * item.unitCost), 0);
  }

  calculateTax(): number {
    return this.calculateSubtotal() * 0.075;
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.calculateTax();
  }

  savePurchaseOrder(): void {
    if (this.poForm.invalid) {
      this.toastr.warning('Please select a supplier and expected delivery date', 'Validation Error');
      return;
    }

    const validItems = this.poItems.filter(item => item.itemId && item.quantityOrdered > 0);
    if (validItems.length === 0) {
      this.toastr.warning('Please add at least one item to the purchase order', 'Validation Error');
      return;
    }

    this.isSaving = true;
    this.cdr.detectChanges();
    const poData = {
      ...this.poForm.value,
      items: validItems.map(item => ({
        itemId: item.itemId,
        quantityOrdered: item.quantityOrdered,
        unitCost: item.unitCost,
        notes: ''
      }))
    };

    if (this.editingPO) {
      this.inventoryService.updatePurchaseOrder(this.editingPO.poNumber, poData).subscribe({
        next: (response:any) => {
          this.isSaving = false;
          if (response.success) {
            this.toastr.success('Purchase order updated successfully', 'Success');
            this.closeModal();
            this.loadPurchaseOrders();
          } else {
            this.toastr.error(response.message || 'Update failed', 'Error');
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isSaving = false;
          this.toastr.error(error.message || 'Failed to update purchase order', 'Error');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.inventoryService.createPurchaseOrder(poData).subscribe({
        next: (response:any) => {
          this.isSaving = false;
          if (response.success) {
            this.toastr.success('Purchase order created successfully', 'Success');
            this.closeModal();
            this.loadPurchaseOrders();
          } else {
            this.toastr.error(response.error.message || 'Creation failed', 'Error');
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isSaving = false;
          this.toastr.error(error.message || 'Failed to create purchase order', 'Error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  approveOrder(po: PurchaseOrder): void {
    if (confirm(`Approve purchase order #${po.poNumber}?`)) {
      this.inventoryService.approvePurchaseOrder(po.poNumber).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success('Purchase order approved', 'Success');
            this.loadPurchaseOrders();
          } else {
            this.toastr.error(response.message || 'Approval failed', 'Error');
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.toastr.error(error.message || 'Failed to approve order', 'Error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancelOrder(po: PurchaseOrder): void {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason) {
      this.inventoryService.cancelPurchaseOrder(po.poNumber, reason).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success('Purchase order cancelled', 'Success');
            this.loadPurchaseOrders();
          } else {
            this.toastr.error(response.message || 'Cancellation failed', 'Error');
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.toastr.error(error.message || 'Failed to cancel order', 'Error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  openReceiveModal(po: PurchaseOrder): void {
    this.selectedPO = po;
    this.receiveForm.reset({
      invoiceNumber: '',
      notes: ''
    });
    this.receiveItems = po.items.map(item => ({
      poItemId: item.poItemId,
      itemName: item.itemName,
      itemCode: item.itemCode,
      quantityOrdered: item.quantityOrdered,
      quantityReceived: item.quantityReceived,
      quantityToReceive: 0,
      quantityAccepted: 0,
      quantityRejected: 0,
      rejectionReason: ''
    }));
    this.showReceiveModal = true;
    this.cdr.detectChanges();
  }

  closeReceiveModal(): void {
    this.showReceiveModal = false;
    this.selectedPO = null;
    this.cdr.detectChanges();
  }

  updateReceiveQuantities(index: number): void {
    const item = this.receiveItems[index];
    item.quantityAccepted = item.quantityToReceive;
    item.quantityRejected = 0;
    this.cdr.detectChanges();
  }

  receiveGoods(): void {
    const receiptData = {
      poNumber: this.selectedPO!.poNumber,
      invoiceNumber: this.receiveForm.get('invoiceNumber')?.value,
      notes: this.receiveForm.get('notes')?.value,
      items: this.receiveItems.map(item => ({
        poItemId: item.poItemId,
        quantityReceived: item.quantityToReceive,
        quantityAccepted: item.quantityToReceive,
        quantityRejected: 0,
        rejectionReason: ''
      }))
    };

    this.isSaving = true;
    this.cdr.detectChanges();

    this.inventoryService.receivePurchaseOrder(this.selectedPO!.poNumber, receiptData).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success) {
          this.toastr.success('Goods received successfully', 'Success');
          this.closeReceiveModal();
          this.loadPurchaseOrders();
        } else {
          this.toastr.error(response.message || 'Receiving failed', 'Error');
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isSaving = false;
        this.toastr.error(error.message || 'Failed to receive goods', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'Draft': return 'status-draft';
      case 'Submitted': return 'status-submitted';
      case 'Approved': return 'status-approved';
      case 'Received': return 'status-received';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch(status) {
      case 'Draft': return 'fas fa-file-alt';
      case 'Submitted': return 'fas fa-paper-plane';
      case 'Approved': return 'fas fa-check-circle';
      case 'Received': return 'fas fa-boxes';
      case 'Cancelled': return 'fas fa-ban';
      default: return 'fas fa-circle';
    }
  }

  isDateOverdue(date: Date): boolean {
    return new Date(date) < new Date();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatPrice(price: number): string {
    return `₦${price.toLocaleString()}`;
  }

  getSupplierName(supplierId: number): string {
    const supplier = this.suppliers.find(s => s.supplierId === supplierId);
    return supplier ? supplier.supplierName : 'Unknown';
  }

  trackByPurchaseOrder(index: number, po: PurchaseOrder): number {
    return po.poNumber;
  }
}
