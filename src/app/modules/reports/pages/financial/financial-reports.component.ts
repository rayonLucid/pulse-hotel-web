// src/app/modules/reports/pages/financial/financial-reports.component.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

import { ToastrService } from 'ngx-toastr';
import { ReportService } from '../../../../core/services/report';
Chart.register(...registerables);

@Component({
  selector: 'app-financial-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financial-reports.component.html',
  styleUrls: ['./financial-reports.component.scss']
})
export class FinancialReportsComponent implements OnInit, AfterViewInit {
  // Date Range
  startDate: string = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];

  // Report Period
  reportPeriod: 'monthly' | 'quarterly' | 'yearly' = 'monthly';
  fiscalYear: number = new Date().getFullYear();
  fiscalYears: number[] = [];

  // Charts
  revenueChart: Chart | null = null;
  expenseChart: Chart | null = null;
  profitChart: Chart | null = null;

  // Financial Data
  financialData: any = null;
  revenueBreakdown: any[] = [];
  expenseBreakdown: any[] = [];
  monthlyData: any[] = [];

  // KPIs
  kpis = {
    totalRevenue: 0,
    totalExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    profitMargin: 0,
    ebitda: 0,
    revenueGrowth: 0,
    expenseGrowth: 0
  };

  // Loading state
  isLoading = false;
  selectedChartType: 'line' | 'bar' = 'line';

  constructor(
    private reportService: ReportService,
    private toastr: ToastrService
  ) {
    // Generate fiscal years (last 5 years)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 4; i <= currentYear; i++) {
      this.fiscalYears.push(i);
    }
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  loadData(): void {
    this.isLoading = true;

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    Promise.all([
      this.loadFinancialReport(start, end),
      this.loadRevenueBreakdown(start, end),
      this.loadExpenseBreakdown(start, end)
    ]).finally(() => {
      this.isLoading = false;
      this.updateCharts();
      this.calculateKPIs();
    });
  }

  loadFinancialReport(startDate: Date, endDate: Date): Promise<void> {
    return new Promise((resolve) => {
      this.reportService.getFinancialReport(startDate, endDate).subscribe({
        next: (response:any) => {
          if (response.success) {
            this.financialData = response.data;
            this.monthlyData = response.data.monthlyData || this.generateMonthlyData();
            this.kpis.totalRevenue = response.data.summary?.totalRevenue || 0;
            this.kpis.totalExpenses = response.data.summary?.totalExpenses || 0;
            this.kpis.grossProfit = response.data.summary?.grossProfit || 0;
            this.kpis.netProfit = response.data.summary?.netProfit || 0;
            this.kpis.profitMargin = response.data.summary?.profitMargin || 0;
            this.kpis.ebitda = response.data.summary?.ebitda || 0;
          }
          resolve();
        },
        error: (error:any) => {
          console.error('Error loading financial report:', error);
          this.setFallbackData();
          resolve();
        }
      });
    });
  }

  loadRevenueBreakdown(startDate: Date, endDate: Date): Promise<void> {
    return new Promise((resolve) => {
      this.reportService.getRevenueBySource(startDate, endDate).subscribe({
        next: (response:any) => {
          if (response.success) {
            this.revenueBreakdown = response.data.revenueBySource || this.getDefaultRevenueBreakdown();
          }
          resolve();
        },
        error: (error:any) => {
          console.error('Error loading revenue breakdown:', error);
          this.revenueBreakdown = this.getDefaultRevenueBreakdown();
          resolve();
        }
      });
    });
  }

  loadExpenseBreakdown(startDate: Date, endDate: Date): Promise<void> {
    return new Promise((resolve) => {
      // This would come from an API endpoint
      setTimeout(() => {
        this.expenseBreakdown = this.getDefaultExpenseBreakdown();
        resolve();
      }, 500);
    });
  }

  setFallbackData(): void {
    this.generateMonthlyData();
    this.kpis = {
      totalRevenue: 18500000,
      totalExpenses: 10175000,
      grossProfit: 8325000,
      netProfit: 5827500,
      profitMargin: 31.5,
      ebitda: 7480000,
      revenueGrowth: 12.5,
      expenseGrowth: 8.2
    };
    this.revenueBreakdown = this.getDefaultRevenueBreakdown();
    this.expenseBreakdown = this.getDefaultExpenseBreakdown();
  }

  generateMonthlyData(): any[] {
    const data = [];
    for (let i = 1; i <= 12; i++) {
      const monthName = new Date(2024, i - 1, 1).toLocaleString('default', { month: 'short' });
      const revenue = 12000000 + Math.random() * 10000000;
      const expenses = revenue * 0.55;

      data.push({
        month: monthName,
        revenue: revenue,
        expenses: expenses,
        profit: revenue - expenses
      });
    }
    return data;
  }

  getDefaultRevenueBreakdown(): any[] {
    return [
      { source: 'Room Revenue', amount: 12950000, percentage: 70, color: '#c49a6c' },
      { source: 'F&B Revenue', amount: 2775000, percentage: 15, color: '#3b82f6' },
      { source: 'Spa Revenue', amount: 925000, percentage: 5, color: '#10b981' },
      { source: 'Other Revenue', amount: 1850000, percentage: 10, color: '#f59e0b' }
    ];
  }

  getDefaultExpenseBreakdown(): any[] {
    return [
      { category: 'Payroll', amount: 4578750, percentage: 45, color: '#ef4444' },
      { category: 'Marketing', amount: 1017500, percentage: 10, color: '#f59e0b' },
      { category: 'Utilities', amount: 814000, percentage: 8, color: '#10b981' },
      { category: 'Maintenance', amount: 712250, percentage: 7, color: '#8b5cf6' },
      { category: 'Supplies', amount: 1526250, percentage: 15, color: '#06b6d4' },
      { category: 'Other', amount: 1526250, percentage: 15, color: '#6b7280' }
    ];
  }

  calculateKPIs(): void {
    // Calculate growth rates
    // This would be calculated from actual data
    this.kpis.revenueGrowth = 12.5;
    this.kpis.expenseGrowth = 8.2;
  }

  initCharts(): void {
    this.initRevenueChart();
    this.initExpenseChart();
    this.initProfitChart();
  }

  updateCharts(): void {
    if (this.revenueChart) this.revenueChart.destroy();
    if (this.expenseChart) this.expenseChart.destroy();
    if (this.profitChart) this.profitChart.destroy();
    this.initCharts();
  }

  initRevenueChart(): void {
    const canvas = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!canvas) return;

    const labels = this.monthlyData.map(d => d.month);
    const data = this.monthlyData.map(d => d.revenue);

    this.revenueChart = new Chart(canvas, {
      type: this.selectedChartType,
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue',
          data: data,
          borderColor: '#c49a6c',
          backgroundColor: this.selectedChartType === 'bar' ? '#c49a6c' : 'rgba(196, 154, 108, 0.1)',
          borderWidth: 2,
          fill: this.selectedChartType === 'line',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `₦${(context.raw as number).toLocaleString()}`
            }
          }
        },
        scales: {
          y: {
            title: { display: true, text: 'Amount (₦)' },
            ticks: { callback: (value) => `₦${(Number(value) / 1000000).toFixed(1)}M` }
          }
        }
      }
    });
  }

  initExpenseChart(): void {
    const canvas = document.getElementById('expenseChart') as HTMLCanvasElement;
    if (!canvas) return;

    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: this.expenseBreakdown.map(e => e.category),
        datasets: [{
          data: this.expenseBreakdown.map(e => e.amount),
          backgroundColor: this.expenseBreakdown.map(e => e.color),
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw as number;
                const percentage = ((value / this.kpis.totalExpenses) * 100).toFixed(1);
                return `${label}: ₦${value.toLocaleString()} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  initProfitChart(): void {
    const canvas = document.getElementById('profitChart') as HTMLCanvasElement;
    if (!canvas) return;

    const labels = this.monthlyData.map(d => d.month);
    const revenueData = this.monthlyData.map(d => d.revenue);
    const expensesData = this.monthlyData.map(d => d.expenses);
    const profitData = this.monthlyData.map(d => d.profit);

    this.profitChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          { label: 'Revenue', data: revenueData, backgroundColor: '#c49a6c', borderRadius: 8 },
          { label: 'Expenses', data: expensesData, backgroundColor: '#ef4444', borderRadius: 8 },
          { label: 'Profit', data: profitData, backgroundColor: '#10b981', borderRadius: 8 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `₦${(context.raw as number).toLocaleString()}`
            }
          }
        },
        scales: {
          y: {
            title: { display: true, text: 'Amount (₦)' },
            ticks: { callback: (value) => `₦${(Number(value) / 1000000).toFixed(1)}M` }
          }
        }
      }
    });
  }

  onDateRangeChange(): void {
    this.loadData();
  }

  onReportPeriodChange(): void {
    this.loadData();
  }

  onChartTypeChange(): void {
    this.initRevenueChart();
  }

  exportData(): void {
    this.toastr.info('Export functionality will be implemented soon', 'Coming Soon');
  }

  formatCurrency(value: number): string {
    return `₦${value.toLocaleString()}`;
  }

  formatNumber(value: number): string {
    return value.toLocaleString();
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }
}
