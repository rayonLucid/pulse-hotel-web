// src/app/core/models/inventory.model.ts
export interface InventoryItem {
  itemId: number;
  itemCode: string;
  itemName: string;
  categoryId: number;
  categoryName: string;
  unitOfMeasure: string;
  unitCost: number;
  sellingPrice?: number;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minimumStock: number;
  maximumStock?: number;
  reorderLevel: number;
  reorderQuantity: number;
  storageLocation: string;
  stockStatus: 'Critical' | 'Low' | 'Normal' | 'Overstock';
  totalValue: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  supplierId: number;
  supplierName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  address: string;
  taxNumber: string;
  paymentTerms: string;
  leadTimeDays: number;
  rating?: number;
  isActive: boolean;
  createdAt: Date;
}

export interface PurchaseOrder {
  poNumber: number;
  supplierId: number;
  supplierName: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Received' | 'Cancelled';
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  items: PurchaseOrderItem[];
  createdAt: Date;

}

export interface PurchaseOrderItem {
  poItemId: number;
  itemId: number;
  itemName: string;
  itemCode: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
  notes?: string;
}

export interface StockTransaction {
  transactionId: number;
  itemId: number;
  itemName: string;
  transactionType: 'Received' | 'Issued' | 'Returned' | 'Adjusted' | 'Damaged';
  quantity: number;
  unitCost: number;
  totalCost: number;
  reference: string;
  notes: string;
  createdBy: string;
  createdAt: Date;
}

export interface StockAlert {
  alertId: number;
  itemId: number;
  itemName: string;
  itemCode: string;
  alertType: 'Low Stock' | 'Out of Stock'|'Critical';
  currentStock: number;
  reorderLevel: number;
  suggestedOrderQuantity: number;
  isResolved: boolean;
  createdAt: Date;
}

export interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalInventoryValue: number;
  pendingOrders: number;
  overdueOrders: number;
  stockByCategory: { category: string; count: number }[];
  valueByCategory: { category: string; value: number }[];
}

export interface ItemFilter {
  categoryId?: number;
  searchTerm?: string;
  stockStatus?: string;
  page: number;
  pageSize: number;
}
