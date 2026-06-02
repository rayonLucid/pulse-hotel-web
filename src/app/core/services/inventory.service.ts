// src/app/core/services/inventory.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  InventoryItem,
  Supplier,
  PurchaseOrder,
  StockTransaction,
  StockAlert,
  DashboardStats,
  ItemFilter
} from '../models/inventory.model';
import { AppConfigService } from './app.config.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
 // private apiUrl = `${environment.apiUrl}/inventory`;

 private rootUrl = "";
 public apiUrl = '';
   constructor(private http: HttpClient,private readonly config:AppConfigService) {
 this.apiUrl = `${this.config.apiUrl}/inventory`;
 this.rootUrl = this.config.rootUrl;
   }

  // ==================== ITEM MANAGEMENT ====================

  getItems(filter: ItemFilter): Observable<{ data: InventoryItem[]; pagination: any }> {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.categoryId) params = params.set('categoryId', filter.categoryId.toString());
    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
    if (filter.stockStatus) params = params.set('stockStatus', filter.stockStatus);

    return this.http.get<{ data: InventoryItem[]; pagination: any }>(`${this.apiUrl}/items`, { params });
  }
getAllItems(): Observable<{ success: boolean; data: InventoryItem[] }> {
    return this.http.get<{ success: boolean; data: InventoryItem[] }>(`${this.apiUrl}/items/all`);
  }
  getItemById(id: number): Observable<{ success: boolean; data: InventoryItem }> {
    return this.http.get<{ success: boolean; data: InventoryItem }>(`${this.apiUrl}/items/${id}`);
  }

  getItemByCode(code: string): Observable<{ success: boolean; data: InventoryItem }> {
    return this.http.get<{ success: boolean; data: InventoryItem }>(`${this.apiUrl}/items/code/${code}`);
  }

  createItem(itemData: any): Observable<{ success: boolean; data: InventoryItem }> {
    return this.http.post<{ success: boolean; data: InventoryItem }>(`${this.apiUrl}/items`, itemData);
  }

  updateItem(id: number, itemData: any): Observable<{ success: boolean; data: InventoryItem }> {
    return this.http.put<{ success: boolean; data: InventoryItem }>(`${this.apiUrl}/items/${id}`, itemData);
  }

  deleteItem(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/items/${id}`);
  }

  // ==================== STOCK MANAGEMENT ====================

  getStockAlerts(): Observable<{ success: boolean; data: StockAlert[] }> {
    return this.http.get<{ success: boolean; data: StockAlert[] }>(`${this.apiUrl}/stock/alerts`);
  }

  getLowStockAlerts(): Observable<{ success: boolean; data: StockAlert[] }> {
    return this.http.get<{ success: boolean; data: StockAlert[] }>(`${this.apiUrl}/stock/LowStockAlerts`);
  }

  getStockTransactions(itemId: number, startDate: Date, endDate: Date): Observable<{ success: boolean; data: StockTransaction[] }> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get<{ success: boolean; data: StockTransaction[] }>(`${this.apiUrl}/stock/transactions/${itemId}`, { params });
  }

  adjustStock(transaction: any): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/stock/adjust`, transaction);
  }

  // ==================== SUPPLIER MANAGEMENT ====================

  getSuppliers(isActive?: boolean): Observable<{ success: boolean; data: Supplier[] }> {
    let params = new HttpParams();
    if (isActive !== undefined) params = params.set('isActive', isActive.toString());
    return this.http.get<{ success: boolean; data: Supplier[] }>(`${this.apiUrl}/suppliers`, { params });
  }



  createSupplier(supplierData: any): Observable<{ success: boolean; data: Supplier }> {
    return this.http.post<{ success: boolean; data: Supplier }>(`${this.apiUrl}/suppliers`, supplierData);
  }

  updateSupplier(id: number, supplierData: any): Observable<{ success: boolean; data: Supplier }> {
    return this.http.put<{ success: boolean; data: Supplier }>(`${this.apiUrl}/suppliers/${id}`, supplierData);
  }

  deleteSupplier(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/suppliers/${id}`);
  }

  getSupplierById(id: number): Observable<{ success: boolean; data: Supplier }> {
    return this.http.get<{ success: boolean; data: Supplier }>(`${this.apiUrl}/suppliers/${id}`);
  }

  // ==================== PURCHASE ORDERS ====================

  getPurchaseOrders(status?: string): Observable<{ success: boolean; data: PurchaseOrder[] }> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<{ success: boolean; data: PurchaseOrder[] }>(`${this.apiUrl}/purchase-orders`, { params });
  }
printPO(poNumber: number) : Observable<Blob> {
  return this.http.get(`${this.apiUrl}/purchase-orders/${poNumber}/print`, {
    responseType: 'blob'
  });
}
  getPurchaseOrderById(poNumber: number): Observable<{ success: boolean; data: PurchaseOrder }> {
    return this.http.get<{ success: boolean; data: PurchaseOrder }>(`${this.apiUrl}/purchase-orders/${poNumber}`);
  }

  createPurchaseOrder(poData: any): Observable<{ success: boolean; data: PurchaseOrder }> {
    return this.http.post<{ success: boolean; data: PurchaseOrder }>(`${this.apiUrl}/purchase-orders`, poData);
  }

  approvePurchaseOrder(poNumber: number): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/purchase-orders/${poNumber}/approve`, {});
  }

  receivePurchaseOrder(poNumber: number, receiptData: any): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/purchase-orders/${poNumber}/receive`, receiptData);
  }

  cancelPurchaseOrder(poNumber: number, reason: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/purchase-orders/${poNumber}/cancel`, { reason });
  }


updatePurchaseOrder(poNumber: number, poData: any): Observable<{ success: boolean; data: PurchaseOrder }> {
  return this.http.put<{ success: boolean; data: PurchaseOrder }>(`${this.apiUrl}/purchase-orders/${poNumber}`, poData);
}

  // ==================== DASHBOARD & REPORTS ====================

  getDashboardStats(): Observable<{ success: boolean; data: DashboardStats }> {
    return this.http.get<{ success: boolean; data: DashboardStats }>(`${this.apiUrl}/dashboard`);
  }

  generateStockReport(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/stock`, { responseType: 'blob' });
  }

  generatePurchaseOrderReport(startDate: Date, endDate: Date): Observable<Blob> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get(`${this.apiUrl}/reports/purchase-orders`, { params, responseType: 'blob' });
  }

  generateInventoryValuation(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/valuation`, { responseType: 'blob' });
  }

  // ==================== CATEGORIES ====================

  getCategories(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/categories`);
  }

    // ==================== BATCH OPERATIONS ====================

  bulkImportItems(file: File): Observable<{ success: boolean; message: string; imported: number; failed: number }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean; message: string; imported: number; failed: number }>(`${this.apiUrl}/items/bulk-import`, formData);
  }

  exportItemsToExcel(filter: any): Observable<Blob> {
    let params = new HttpParams();
    if (filter.categoryId) params = params.set('categoryId', filter.categoryId.toString());
    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
    if (filter.stockStatus) params = params.set('stockStatus', filter.stockStatus);
    return this.http.get(`${this.apiUrl}/items/export`, { params, responseType: 'blob' });
  }



// ==================== SUPPLIER PERFORMANCE REPORT ====================

/**
 * Generate supplier performance report
 */
generateSupplierReport(supplierId?: number): Observable<Blob> {
  let params = new HttpParams();
  if (supplierId) params = params.set('supplierId', supplierId.toString());
  return this.http.get(`${this.apiUrl}/reports/suppliers`, { params, responseType: 'blob' });
}

/**
 * Get supplier performance summary
 */
getSupplierPerformance(supplierId?: number): Observable<{ success: boolean; data: any[] }> {
  let params = new HttpParams();
  if (supplierId) params = params.set('supplierId', supplierId.toString());
  return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/suppliers/performance`, { params });
}

// ==================== STOCK MOVEMENT REPORT ====================

/**
 * Get stock movement summary
 */
getStockMovementSummary(startDate: Date, endDate: Date): Observable<{ success: boolean; data: any }> {
  const params = new HttpParams()
    .set('startDate', startDate.toISOString())
    .set('endDate', endDate.toISOString());
  return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/reports/movement-summary`, { params });
}

// ==================== INVENTORY VALUATION ====================

/**
 * Get inventory valuation summary
 */
getInventoryValuation(): Observable<{ success: boolean; data: any }> {
  return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/reports/valuation-summary`);
}

// src/app/core/services/inventory.service.ts
// Add this method to the InventoryService class

// ==================== STOCK ALERTS ====================

/**
 * Resolve a stock alert
 */
resolveStockAlert(alertId: number): Observable<{ success: boolean; message: string }> {
  return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/stock/alerts/${alertId}/resolve`, {});
}


}
