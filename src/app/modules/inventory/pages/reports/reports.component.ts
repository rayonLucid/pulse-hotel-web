// src/app/modules/inventory/pages/reports/reports.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { InventoryService } from '../../../../core/services/inventory.service';
import { InventoryItem, Supplier, PurchaseOrder } from '../../../../core/models/inventory.model';

@Component({
  selector: 'app-inventory-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  activeTab: 'stock' | 'movement' | 'valuation' | 'supplier' | 'purchase' = 'stock';

  // Date filters
  startDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  endDate: Date = new Date();

  // Stock Report Filters
  stockCategoryId: number | null = null;
  stockStatus: string = '';
  categories: any[] = [];

  // Stock Movement Filters
  movementItemId: number | null = null;
  movementItemName: string = '';
  items: InventoryItem[] = [];

  // Supplier Report Filters
  supplierId: number | null = null;
  suppliers: Supplier[] = [];

  // Purchase Order Report Filters
  poStatus: string = '';
  poSupplierId: number | null = null;

  // Report Data
  stockData: InventoryItem[] = [];
  movementData: any[] = [];
  valuationData: any = null;
  supplierData: any = null;
  purchaseData: PurchaseOrder[] = [];

  isLoading = false;
  isGenerating = false;

  // Status options
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Critical', label: 'Critical' },
    { value: 'Low', label: 'Low' },
    { value: 'Normal', label: 'Normal' },
    { value: 'Overstock', label: 'Overstock' }
  ];

  poStatusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Submitted', label: 'Submitted' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Received', label: 'Received' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  constructor(
    private inventoryService: InventoryService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadItems();
    this.loadSuppliers();
    this.loadStockReport();
  }
isDateOverdue(date: Date): boolean {
  return new Date(date) < new Date();
}
  loadCategories(): void {
    this.inventoryService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data;
        }
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  loadItems(): void {
    this.inventoryService.getItems({ page: 1, pageSize: 100 }).subscribe({
      next: (response:any) => {
        if (response.success) {
          this.items = response.data;
        }
      },
      error: (error) => console.error('Error loading items:', error)
    });
  }

  loadSuppliers(): void {
    this.inventoryService.getSuppliers(true).subscribe({
      next: (response) => {
        if (response.success) {
          this.suppliers = response.data;
        }
      },
      error: (error) => console.error('Error loading suppliers:', error)
    });
  }

  // ==================== STOCK REPORT ====================

  loadStockReport(): void {
    this.isLoading = true;
    const filter = {
      page: 1,
      pageSize: 1000,
      categoryId: this.stockCategoryId || undefined,
      stockStatus: this.stockStatus || undefined
    };

    this.inventoryService.getItems(filter).subscribe({
      next: (response:any) => {
        if (response.success) {
          this.stockData = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stock report:', error);
        this.toastr.error('Failed to load stock report', 'Error');
        this.isLoading = false;
      }
    });
  }

  exportStockReport(): void {
    this.isGenerating = true;
    this.inventoryService.generateStockReport().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock_report_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastr.success('Stock report downloaded', 'Success');
        this.isGenerating = false;
      },
      error: (error) => {
        console.error('Error exporting stock report:', error);
        this.toastr.error('Failed to export stock report', 'Error');
        this.isGenerating = false;
      }
    });
  }

  // ==================== STOCK MOVEMENT REPORT ====================

  loadMovementReport(): void {
    if (!this.movementItemId) {
      this.toastr.warning('Please select an item', 'Selection Required');
      return;
    }

    this.isLoading = true;
    this.inventoryService.getStockTransactions(this.movementItemId, this.startDate, this.endDate).subscribe({
      next: (response) => {
        if (response.success) {
          this.movementData = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading movement report:', error);
        this.toastr.error('Failed to load movement report', 'Error');
        this.isLoading = false;
      }
    });
  }

  onItemSelect(itemId: number|null): void {
    const selected = this.items.find(i => i.itemId === itemId);
    this.movementItemName = selected ? selected.itemName : '';
    this.loadMovementReport();
  }

  // ==================== VALUATION REPORT ====================

  loadValuationReport(): void {
    this.isLoading = true;
    this.inventoryService.generateInventoryValuation().subscribe({
      next: (blob) => {
        // For valuation, we'll display in a table instead of downloading immediately
        this.parseValuationData(blob);
        this.isLoading = false;
      },
      error: (error:any) => {
        console.error('Error loading valuation report:', error);
        // Fallback to API data
        this.inventoryService.getItems({ page: 1, pageSize: 1000 }).subscribe({
          next: (response:any) => {
            if (response.success) {
              this.calculateValuationFromItems(response.data);
            }
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error loading items for valuation:', err);
            this.isLoading = false;
          }
        });
      }
    });
  }

  calculateValuationFromItems(items: InventoryItem[]): void {
    const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
    const byCategory = items.reduce((acc, item) => {
      if (!acc[item.categoryName]) {
        acc[item.categoryName] = { count: 0, value: 0 };
      }
      acc[item.categoryName].count++;
      acc[item.categoryName].value += item.totalValue;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    this.valuationData = {
      totalItems: items.length,
      totalValue: totalValue,
      byCategory: Object.entries(byCategory).map(([name, data]) => ({
        category: name,
        count: data.count,
        value: data.value,
        percentage: (data.value / totalValue) * 100
      }))
    };
  }

  parseValuationData(blob: Blob): void {
    // For now, use the calculation method
    this.inventoryService.getItems({ page: 1, pageSize: 1000 }).subscribe({
      next: (response:any) => {
        if (response.success) {
          this.calculateValuationFromItems(response.data);
        }
      },
      error: (error) => console.error('Error parsing valuation data:', error)
    });
  }

  exportValuationReport(): void {
    this.isGenerating = true;
    this.inventoryService.generateInventoryValuation().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_valuation_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastr.success('Valuation report downloaded', 'Success');
        this.isGenerating = false;
      },
      error: (error) => {
        console.error('Error exporting valuation report:', error);
        this.toastr.error('Failed to export valuation report', 'Error');
        this.isGenerating = false;
      }
    });
  }

  // ==================== SUPPLIER PERFORMANCE REPORT ====================

  loadSupplierReport(): void {
    this.isLoading = true;
    this.inventoryService.generateSupplierReport(this.supplierId || undefined).subscribe({
      next: (blob:any) => {
        // For display, we'll show summary
        this.loadSupplierSummary();
        this.isLoading = false;
      },
      error: (error:any) => {
        console.error('Error loading supplier report:', error);
        this.loadSupplierSummary();
        this.isLoading = false;
      }
    });
  }

  loadSupplierSummary(): void {
    this.inventoryService.getSuppliers().subscribe({
      next: (response) => {
        if (response.success) {
          // Calculate supplier metrics
          this.supplierData = response.data.map(supplier => ({
            ...supplier,
            orderCount: 0,
            totalSpent: 0,
            averageLeadTime: supplier.leadTimeDays,
            onTimeDelivery: 95 // Mock percentage
          }));
        }
      },
      error: (error) => console.error('Error loading supplier summary:', error)
    });
  }

  exportSupplierReport(): void {
    this.isGenerating = true;
    this.inventoryService.generateSupplierReport(this.supplierId || undefined).subscribe({
      next: (blob:any) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `supplier_report_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastr.success('Supplier report downloaded', 'Success');
        this.isGenerating = false;
      },
      error: (error:any) => {
        console.error('Error exporting supplier report:', error);
        this.toastr.error('Failed to export supplier report', 'Error');
        this.isGenerating = false;
      }
    });
  }

  // ==================== PURCHASE ORDER REPORT ====================

  loadPurchaseOrderReport(): void {
    this.isLoading = true;
    this.inventoryService.getPurchaseOrders(this.poStatus || undefined).subscribe({
      next: (response) => {
        if (response.success) {
          let filtered = response.data;
          if (this.poSupplierId) {
            filtered = filtered.filter(po => po.supplierId === this.poSupplierId);
          }
          this.purchaseData = filtered;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading purchase order report:', error);
        this.isLoading = false;
      }
    });
  }

  exportPurchaseOrderReport(): void {
    this.isGenerating = true;
    this.inventoryService.generatePurchaseOrderReport(this.startDate, this.endDate).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `purchase_orders_${this.startDate.toISOString().split('T')[0]}_to_${this.endDate.toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastr.success('Purchase order report downloaded', 'Success');
        this.isGenerating = false;
      },
      error: (error) => {
        console.error('Error exporting purchase order report:', error);
        this.toastr.error('Failed to export purchase order report', 'Error');
        this.isGenerating = false;
      }
    });
  }

  // ==================== UTILITY METHODS ====================

  setActiveTab(tab: 'stock' | 'movement' | 'valuation' | 'supplier' | 'purchase'): void {
    this.activeTab = tab;
    if (tab === 'stock') {
      this.loadStockReport();
    } else if (tab === 'valuation') {
      this.loadValuationReport();
    } else if (tab === 'supplier') {
      this.loadSupplierReport();
    } else if (tab === 'purchase') {
      this.loadPurchaseOrderReport();
    }
  }

  formatPrice(price: number): string {
    return `₦${price.toLocaleString()}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString();
  }



  getTransactionTypeClass(type: string): string {
    switch(type) {
      case 'Received': return 'type-received';
      case 'Issued': return 'type-issued';
      case 'Returned': return 'type-returned';
      case 'Adjusted': return 'type-adjusted';
      case 'Damaged': return 'type-damaged';
      default: return '';
    }
  }

  // src/app/modules/inventory/pages/reports/reports.component.ts
// Add these missing methods to the ReportsComponent class

// ==================== STATUS CLASS METHODS ====================

/**
 * Get status class for purchase order status
 */
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

/**
 * Get status class for stock status
 */
getStockStatusClass(status: string): string {
  switch(status) {
    case 'Critical': return 'status-critical';
    case 'Low': return 'status-low';
    case 'Normal': return 'status-normal';
    case 'Overstock': return 'status-overstock';
    default: return '';
  }
}


// Add to ReportsComponent class

/**
 * Check if a date is today
 */
isToday(date: Date): boolean {
  const today = new Date();
  const compareDate = new Date(date);
  return compareDate.toDateString() === today.toDateString();
}

/**
 * Check if a date is in the past
 */
isPastDate(date: Date): boolean {
  return new Date(date) < new Date();
}

/**
 * Check if a date is in the future
 */
isFutureDate(date: Date): boolean {
  return new Date(date) > new Date();
}

/**
 * Format date for comparison (useful for date range checks)
 */
isWithinDateRange(date: Date, startDate: Date, endDate: Date): boolean {
  const compareDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return compareDate >= start && compareDate <= end;
}
}
