import { Component, OnInit, ViewChild, ElementRef, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Chart, registerables } from 'chart.js';
import { AccountingService, FinancialDashboard } from '../../../core/services/accounting.service';
import { ToastrService } from 'ngx-toastr';
Chart.register(...registerables);

@Component({
  selector: 'app-accounting-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accounting-dashboard.component.html',
  styleUrls: ['./accounting-dashboard.component.scss']
})
export class AccountingDashboardComponent implements OnInit {
  @ViewChild('revenueChart') revenueChartCanvas!: ElementRef;
  cdr = inject(ChangeDetectorRef)
  toastService =inject(ToastrService)
  private accountingService = inject(AccountingService);
  dashboard: FinancialDashboard | null = null;
  loading = false;
  private chart: Chart | null = null;

  ngOnInit() { this.loadDashboard(); }

  loadDashboard() {
    this.loading = true;
    this.accountingService.getFinancialDashboard().subscribe({
      next: (data) => {
     //   console.log('Financial dashboard data:', data);
        this.dashboard = data;
        this.loading = false;
        this.cdr.detectChanges();
        this.renderChart();
      },
      error: (err) => {
        console.error(err);
        this.toastService.error(err,"Error")
         this.loading = false;
          this.cdr.detectChanges()
this.loadDashboard()
        }

    });
  }

  renderChart() {
  //  console.log('Rendering chart with dashboard data:', this.dashboard);
    if (!this.dashboard || !this.revenueChartCanvas) return;
    if (this.chart) this.chart.destroy();
    const trend = this.dashboard.monthlyTrend;
    this.chart = new Chart(this.revenueChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: trend.map(t => `${t.year}-${t.month.toString().padStart(2,'0')}`),
        datasets: [{
          label: 'Monthly Revenue',
          data: trend.map(t => t.total),
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79,70,229,0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: { responsive: true, maintainAspectRatio: true }
    });
  }
}
