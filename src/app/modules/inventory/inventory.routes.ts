// src/app/modules/inventory/inventory.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ItemsComponent } from './pages/items/items.component';
import { StockComponent } from './pages/stock/stock.component';
import { SuppliersComponent } from './pages/suppliers/suppliers.component';
import { PurchaseOrdersComponent } from './pages/purchase-orders/purchase-orders.component';
import { ReportsComponent } from './pages/reports/reports.component';


export const INVENTORY_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'items', component: ItemsComponent },
  { path: 'stock', component: StockComponent },
  { path: 'suppliers', component: SuppliersComponent },
  { path: 'purchase-orders', component: PurchaseOrdersComponent },
  { path: 'reports', component: ReportsComponent },
  { path: '**', redirectTo: 'dashboard' }
];
