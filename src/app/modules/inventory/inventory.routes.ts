// src/app/modules/inventory/inventory.routes.ts
import { Routes } from '@angular/router';
import { InventoryComponent } from './inventory.component/inventory.component';


export const INVENTORY_ROUTES: Routes = [
  { path: '', component: InventoryComponent },
  { path: 'items', component: InventoryComponent },
  { path: 'stock', component: InventoryComponent },
  { path: 'suppliers', component: InventoryComponent },
  { path: 'purchase-orders', component: InventoryComponent }
];
