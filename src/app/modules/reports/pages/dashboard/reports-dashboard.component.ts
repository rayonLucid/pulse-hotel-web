// src/app/modules/reports/pages/dashboard/reports-dashboard.component.ts
import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

import { ToastrService } from 'ngx-toastr';
import { ReportService } from '../../../../core/services/report';
Chart.register(...registerables);

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reports-dashboard.component.html',
  styleUrls: ['./reports-dashboard.component.scss']
})
export class ReportsDashboardComponent implements OnInit, AfterViewInit {
  dateRange = 'month';
  startDate: string = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];

  reportCards = [
    { title: 'Occupancy Reports', icon: 'fas fa-hotel', description: 'Track room occupancy rates, forecasts, and trends', route: '/reports/occupancy', color: 'blue' },
    { title: 'Revenue Reports', icon: 'fas fa-chart-line', description: 'Analyze revenue by room type, source, and time period', route: '/reports/revenue', color: 'green' },
    { title: 'Guest Reports', icon: 'fas fa-users', description: 'Guest demographics, retention, and loyalty insights', route: '/reports/guest', color: 'purple' },
    { title: 'Staff Reports', icon: 'fas fa-user-tie', description: 'Staff performance, attendance, and productivity', route: '/reports/staff', color: 'orange' },
    { title: 'Financial Reports', icon: 'fas fa-chart-pie', description: 'Revenue, expenses, and profitability analysis', route: '/reports/financial', color: 'red' },
    { title: 'Executive Summary', icon: 'fas fa-file-alt', description: 'High-level KPIs and executive insights', route: '/reports/executive', color: 'teal' }
  ];

  recentReports: any[] = [];
  summaryData: any = null;
  isLoading = false;

  revenueChart: Chart | null = null;
  occupancyChart: Chart | null = null;
 private reportService: ReportService = inject(ReportService)
  constructor(

    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadRecentReports();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  loadDashboardData(): void {
    this.isLoading = true;

    this.reportService.getDashboardSummary().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.summaryData = response.data;
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading dashboard data:', error);
        this.setFallbackSummary();
        this.isLoading = false;
      }
    });
  }

  loadRecentReports(): void {
    // This would typically come from an API endpoint
    this.recentReports = [
      { name: 'Monthly Occupancy Report', date: '2024-05-15', type: 'PDF', size: '2.4 MB' },
      { name: 'Q2 Revenue Analysis', date: '2024-05-10', type: 'Excel', size: '1.8 MB' },
      { name: 'Staff Performance May', date: '2024-05-05', type: 'PDF', size: '3.1 MB' },
      { name: 'Guest Satisfaction Survey', date: '2024-05-01', type: 'Excel', size: '1.2 MB' }
    ];
  }

  setFallbackSummary(): void {
    this.summaryData = {
      occupancy: 78.5,
      revenue: 18500000,
      cancellations: 45,
      cancellationRate: 8.5,
      period: { start: this.startDate, end: this.endDate }
    };
  }

  initCharts(): void {
    this.initRevenueTrendChart();
    this.initOccupancyTrendChart();
  }

  initRevenueTrendChart(): void {
    const canvas = document.getElementById('revenueTrendChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.revenueChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue (₦)',
          data: [12500000, 15000000, 18000000, 22000000, 25000000, 28000000],
          borderColor: '#c49a6c',
          backgroundColor: 'rgba(196, 154, 108, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  initOccupancyTrendChart(): void {
    const canvas = document.getElementById('occupancyTrendChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.occupancyChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Occupancy Rate (%)',
          data: [68, 72, 75, 78, 82, 85],
          backgroundColor: '#c49a6c',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  generateReport(): void {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    this.toastr.info(`Generating report for period ${this.startDate} to ${this.endDate}`, 'Generating Report');
    // Implement actual report generation
  }

  exportReport(report: any): void {
    this.toastr.info(`Exporting ${report.name}`, 'Export Started');
  }

  formatCurrency(value: number): string {
    return `₦${value.toLocaleString()}`;
  }
}
