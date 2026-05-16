// src/app/modules/inventory/pages/stock/stock.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { InventoryService } from '../../../../core/services/inventory.service';
import { InventoryItem, StockTransaction, StockAlert } from '../../../../core/models/inventory.model';

@Component({
  selector: 'app-inventory-stock',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit {
  items: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  stockAlerts: StockAlert[] = [];
  transactions: StockTransaction[] = [];
  isLoading = true;
  isSaving = false;
  showAdjustModal = false;
  showTransactionsModal = false;
  selectedItem: InventoryItem | null = null;
  Math=Math;

  // Pagination with ngx-pagination
  currentPage = 1;
  pageSize = 6;
  totalItems = 0;

  // Filters
  filters = {
    categoryId: null as number | null,
    searchTerm: '',
    stockStatus: ''
  };

  // Transaction filters
  transactionStartDate: Date = new Date(new Date().setDate(new Date().getDate() - 30));
  transactionEndDate: Date = new Date();

  // Stock Adjustment Form
  adjustForm: FormGroup;

  // Transaction types
  transactionTypes = [
    { value: 'Received', label: 'Stock Received', icon: 'fas fa-arrow-down', color: '#10b981' },
    { value: 'Issued', label: 'Stock Issued', icon: 'fas fa-arrow-up', color: '#ef4444' },
    { value: 'Returned', label: 'Stock Returned', icon: 'fas fa-undo-alt', color: '#3b82f6' },
    { value: 'Adjusted', label: 'Stock Adjusted', icon: 'fas fa-sliders-h', color: '#f59e0b' },
    { value: 'Damaged', label: 'Damaged Stock', icon: 'fas fa-exclamation-triangle', color: '#dc2626' }
  ];

  // Stock status options
  stockStatusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Critical', label: 'Critical' },
    { value: 'Low', label: 'Low' },
    { value: 'Normal', label: 'Normal' },
    { value: 'Overstock', label: 'Overstock' }
  ];

  categories: any[] = [];
changeDet =inject(ChangeDetectorRef)
  constructor(
    private inventoryService: InventoryService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.adjustForm = this.fb.group({
      transactionType: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      reference: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadItems();
    this.loadStockAlerts();
  }

  loadCategories(): void {
    this.inventoryService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data;
          this.changeDet.detectChanges()

        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadItems(): void {
    this.isLoading = true;

    const filter = {
      page: 1,
      pageSize: 1000,
      categoryId: this.filters.categoryId || undefined,
      searchTerm: this.filters.searchTerm || undefined,
      stockStatus: this.filters.stockStatus || undefined
    };

    this.inventoryService.getItems(filter).subscribe({
      next: (response:any) => {
        if (response.success) {
          this.items = response.data;
          this.applyFilters();
        }
        this.isLoading = false;
         this.changeDet.detectChanges()
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.toastr.error('Failed to load stock items', 'Error');
        this.isLoading = false;
      }
    });
  }

  loadStockAlerts(): void {
    this.inventoryService.getLowStockAlerts().subscribe({
      next: (response) => {
        if (response.success) {
          this.stockAlerts = response.data;
            this.changeDet.detectChanges()
          console.log(response)
        }
      },
      error: (error) => {
        console.error('Error loading stock alerts:', error);
      }
    });
  }

  loadStockTransactions(itemId: number): void {
    this.inventoryService.getStockTransactions(itemId, this.transactionStartDate, this.transactionEndDate).subscribe({
      next: (response) => {
        if (response.success) {
          this.transactions = response.data;
          this.changeDet.detectChanges()
        }
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.toastr.error('Failed to load transaction history', 'Error');
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.items];

    if (this.filters.searchTerm) {
      const term = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(term) ||
        item.itemCode.toLowerCase().includes(term)
      );
    }

    if (this.filters.stockStatus) {
      filtered = filtered.filter(item => item.stockStatus === this.filters.stockStatus);
    }

    this.filteredItems = filtered;
    this.totalItems = this.filteredItems.length;
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.filters = {
      categoryId: null,
      searchTerm: '',
      stockStatus: ''
    };
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.categoryId || this.filters.searchTerm || this.filters.stockStatus);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openAdjustModal(item: InventoryItem): void {
    this.selectedItem = item;
    this.adjustForm.reset({
      transactionType: '',
      quantity: '',
      reference: '',
      notes: ''
    });
    this.showAdjustModal = true;
  }

  closeAdjustModal(): void {
    this.showAdjustModal = false;
    this.selectedItem = null;
  }

  adjustStock(): void {
    if (this.adjustForm.invalid) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    this.isSaving = true;
    const transactionData = {
      itemId: this.selectedItem!.itemId,
      transactionType: this.adjustForm.get('transactionType')?.value,
      quantity: this.adjustForm.get('quantity')?.value,
      reference: this.adjustForm.get('reference')?.value,
      notes: this.adjustForm.get('notes')?.value
    };

    this.inventoryService.adjustStock(transactionData).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success) {
          this.toastr.success('Stock adjusted successfully', 'Success');
          this.closeAdjustModal();
          this.loadItems();
          this.loadStockAlerts()
             this.changeDet.detectChanges()
        } else {
          this.toastr.error(response.message || 'Adjustment failed', 'Error');
          this.isLoading =false
          this.changeDet.detectChanges()
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.toastr.error(error.error.message || 'Failed to adjust stock', 'Error');
        this.changeDet.detectChanges()
        console.log(error)
      }
    });
  }

  openTransactionsModal(item: InventoryItem): void {
    this.selectedItem = item;
    this.loadStockTransactions(item.itemId);
    this.showTransactionsModal = true;
  }

  closeTransactionsModal(): void {
    this.showTransactionsModal = false;
    this.selectedItem = null;
    this.transactions = [];
  }

  updateTransactionDateRange(): void {
    if (this.selectedItem) {
      this.loadStockTransactions(this.selectedItem.itemId);
    }
  }

  resolveAlert(alertId: number): void {
    this.inventoryService.resolveStockAlert(alertId).subscribe({
      next: (response:any) => {
        if (response.success) {
          this.toastr.success('Alert resolved', 'Success');
          this.loadStockAlerts();
          this.loadItems();
        } else {
          this.toastr.error(response.message || 'Failed to resolve alert', 'Error');
        }
      },
      error: (error:any) => {
        this.toastr.error(error.error.message || 'Failed to resolve alert', 'Error');
        console.log(error)
      }
    });
  }

  getStockStatusClass(status: string): string {
    switch(status) {
      case 'Critical': return 'status-critical';
      case 'Low': return 'status-low';
      case 'Normal': return 'status-normal';
      case 'Overstock': return 'status-overstock';
      default: return '';
    }
  }

  getStockStatusIcon(status: string): string {
    switch(status) {
      case 'Critical': return 'fas fa-exclamation-circle';
      case 'Low': return 'fas fa-exclamation-triangle';
      case 'Normal': return 'fas fa-check-circle';
      case 'Overstock': return 'fas fa-arrow-up';
      default: return 'fas fa-circle';
    }
  }

  getTransactionIcon(type: string): string {
    const transaction = this.transactionTypes.find(t => t.value === type);
    return transaction ? transaction.icon : 'fas fa-exchange-alt';
  }

  getTransactionColor(type: string): string {
    const transaction = this.transactionTypes.find(t => t.value === type);
    return transaction ? transaction.color : '#6b7280';
  }

  getTransactionLabel(type: string): string {
    const transaction = this.transactionTypes.find(t => t.value === type);
    return transaction ? transaction.label : type;
  }

  getStockPercentage(current: number, max: number): number {
    if (max <= 0) return 0;
    return Math.min(100, (current / max) * 100);
  }

  formatPrice(price: number): string {
    return `₦${price.toLocaleString()}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  trackByItemId(index: number, item: InventoryItem): number {
    return item.itemId;
  }
}
