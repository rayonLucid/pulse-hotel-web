import { ChangeDetectorRef, inject } from '@angular/core';
// src/app/modules/inventory/pages/items/items.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { InventoryService } from '../../../../core/services/inventory.service';
import { InventoryItem } from '../../../../core/models/inventory.model';

@Component({
  selector: 'app-inventory-items',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit {
  items: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  categories: any[] = [];
  isLoading = false;
  isSaving = false;
  showItemModal = false;
  editingItem: InventoryItem | null = null;
Math =Math;
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

  // Form
  itemForm: FormGroup;

  // Options
  stockStatusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Critical', label: 'Critical' },
    { value: 'Low', label: 'Low' },
    { value: 'Normal', label: 'Normal' },
    { value: 'Overstock', label: 'Overstock' }
  ];

  unitOptions = [
    'Each', 'Box', 'Bottle', 'Packet', 'Set', 'Roll', 'Liter', 'Kg', 'Piece'
  ];
changeDet =inject(ChangeDetectorRef)
  constructor(
    private inventoryService: InventoryService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.itemForm = this.fb.group({
      itemCode: ['', [Validators.required]],
      itemName: ['', [Validators.required, Validators.minLength(3)]],
      categoryId: ['', [Validators.required]],
      unitOfMeasure: ['', [Validators.required]],
      unitCost: ['', [Validators.required, Validators.min(0)]],
      sellingPrice: [''],
      minimumStock: [0, [Validators.min(0)]],
      maximumStock: [''],
      reorderLevel: [0, [Validators.min(0)]],
      reorderQuantity: [0, [Validators.min(0)]],
      storageLocation: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadItems();
  }
// Add to ItemsComponent class
trackByItemId(index: number, item: InventoryItem): number {
  return item.itemId;
}
  loadCategories(): void {
    this.inventoryService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data;
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
          this.isLoading =false
          this.changeDet.detectChanges()
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.toastr.error('Failed to load items', 'Error');
        this.isLoading = false;
           this.changeDet.detectChanges()
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

  openCreateModal(): void {
    this.editingItem = null;
    this.itemForm.reset({
      itemCode: '',
      itemName: '',
      categoryId: '',
      unitOfMeasure: 'Each',
      unitCost: '',
      sellingPrice: '',
      minimumStock: 0,
      maximumStock: '',
      reorderLevel: 0,
      reorderQuantity: 0,
      storageLocation: ''
    });
    this.showItemModal = true;
  }

  openEditModal(item: InventoryItem): void {
    this.editingItem = item;
    this.itemForm.patchValue({
      itemCode: item.itemCode,
      itemName: item.itemName,
      categoryId: item.categoryId,
      unitOfMeasure: item.unitOfMeasure,
      unitCost: item.unitCost,
      sellingPrice: item.sellingPrice || '',
      minimumStock: item.minimumStock,
      maximumStock: item.maximumStock || '',
      reorderLevel: item.reorderLevel,
      reorderQuantity: item.reorderQuantity,
      storageLocation: item.storageLocation
    });
    this.showItemModal = true;
  }

  closeModal(): void {
    this.showItemModal = false;
    this.editingItem = null;
  }

  saveItem(): void {
    if (this.itemForm.invalid) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    this.isSaving = true;
    const itemData = this.itemForm.value;

    if (this.editingItem) {
      this.inventoryService.updateItem(this.editingItem.itemId, itemData).subscribe({
        next: (response:any) => {
          this.isSaving = false;
          if (response.success) {
            this.toastr.success('Item updated successfully', 'Success');
            this.closeModal();
            this.loadItems();
          } else {
            this.toastr.error(response.message || 'Update failed', 'Error');
          }
        },
        error: (error) => {
          this.isSaving = false;
          this.toastr.error(error.message || 'Failed to update item', 'Error');
        }
      });
    } else {
      this.inventoryService.createItem(itemData).subscribe({
        next: (response:any) => {
          this.isSaving = false;
          if (response.success) {
            this.toastr.success('Item created successfully', 'Success');
            this.closeModal();
            this.loadItems();
          } else {
            this.toastr.error(response.message || 'Creation failed', 'Error');
          }
        },
        error: (error) => {
          this.isSaving = false;
          this.toastr.error(error.message || 'Failed to create item', 'Error');
        }
      });
    }
  }

  deleteItem(item: InventoryItem): void {
    if (confirm(`Are you sure you want to delete ${item.itemName}?`)) {
      this.inventoryService.deleteItem(item.itemId).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success('Item deleted successfully', 'Success');
            this.loadItems();
          } else {
            this.toastr.error(response.message || 'Delete failed', 'Error');
          }
        },
        error: (error) => {
          this.toastr.error(error.message || 'Failed to delete item', 'Error');
        }
      });
    }
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

  formatPrice(price: number): string {
    return `₦${price.toLocaleString()}`;
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.categoryId === categoryId);
    return category ? category.categoryName : 'Unknown';
  }

  generateItemCode(): void {
    const prefix = 'INV';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const itemCode = `${prefix}-${timestamp}-${random}`;
    this.itemForm.patchValue({ itemCode });
  }
}
