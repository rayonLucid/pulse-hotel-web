// src/app/modules/inventory/pages/dashboard/dashboard.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InventoryService } from '../../../../core/services/inventory.service';
import { DashboardStats, StockAlert } from '../../../../core/models/inventory.model';

@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  stockAlerts: StockAlert[] = [];
  isLoading = true;
changeDet = inject(ChangeDetectorRef)
  constructor(public inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadStockAlerts();
  }

  loadDashboard(): void {
    this.inventoryService.getDashboardStats().subscribe({
      next: (response) => {
      //  console.log(response)
        if (response.success) {
          this.stats = response.data;
        }
        this.isLoading = false;
        this.changeDet.detectChanges()
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.isLoading = false;
      }
    });
  }

  loadStockAlerts(): void {
    this.inventoryService.getStockAlerts().subscribe({
      next: (response) => {
        if (response.success) {
          this.stockAlerts = response.data;
          console.log(response)
           this.changeDet.detectChanges()
        }
      },
      error: (error) => {
        console.error('Error loading stock alerts:', error);
      }
    });
  }
export(){
  this.inventoryService.generateStockReport().subscribe(blob => {
          const url = window.URL.createObjectURL(blob);
          window.open(url);
        })
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
}
