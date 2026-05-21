// src/app/modules/reports/pages/revenue/revenue-reports.component.ts
import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

import { ToastrService } from 'ngx-toastr';
import { ReportService } from '../../../../core/services/report';
Chart.register(...registerables);

@Component({
  selector: 'app-revenue-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './revenue-reports.component.html',
  styleUrls: ['./revenue-reports.component.scss']
})
export class RevenueReportsComponent implements OnInit, AfterViewInit {
  // Date Range
  startDate: string = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];

  // Report Type
  reportType: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly';
  chartType: 'line' | 'bar' = 'line';
Math =Math
  // Data
  revenueData: any[] = [];
  revenueBySource: any[] = [];
  revenueByRoomType: any[] = [];

  // Charts
  revenueTrendChart: Chart | null = null;
  sourceBreakdownChart: Chart | null = null;
  roomTypeChart: Chart | null = null;

  // Stats
  stats = {
    totalRevenue: 0,
    averageDailyRate: 0,
    revPAR: 0,
    trevPAR: 0,
    growthVsLastPeriod: 0,
    projectedRevenue: 0
  };

  // KPI Cards
  kpis = [
    { label: 'Total Revenue', value: 0, change: 0, icon: 'fas fa-chart-line', color: 'blue' },
    { label: 'Average Daily Rate', value: 0, change: 0, icon: 'fas fa-dollar-sign', color: 'green' },
    { label: 'RevPAR', value: 0, change: 0, icon: 'fas fa-chart-bar', color: 'purple' },
    { label: 'TrevPAR', value: 0, change: 0, icon: 'fas fa-chart-pie', color: 'orange' }
  ];

  // Loading state
  isLoading = false;
    private reportService: ReportService =inject(ReportService)
  constructor(

    private toastr: ToastrService
  ) {}

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

    // Call the actual API
    this.reportService.getDailyRevenueReport(start, end).subscribe({
      next: (response:any) => {
        if (response.success) {
          this.revenueData = response.data.dailyData || [];
          this.stats.totalRevenue = response.data.summary?.totalRevenue || 0;
          this.stats.averageDailyRate = response.data.summary?.averageDailyRate || 0;
          this.stats.revPAR = response.data.summary?.revPAR || 0;
          this.stats.growthVsLastPeriod = response.data.summary?.growthVsLastPeriod || 0;
          this.stats.projectedRevenue = response.data.projection?.projectedRevenue || 0;

          this.updateKPIs();
          this.generateRevenueBySource();
          this.generateRevenueByRoomType();
          this.updateCharts();
        }
        this.isLoading = false;
      },
      error: (error:any) => {
        console.error('Error loading revenue data:', error);
        this.toastr.error('Failed to load revenue data', 'Error');
        this.isLoading = false;
        this.setFallbackData();
      }
    });
  }

  loadRevenueBySource(): void {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    this.reportService.getRevenueBySource(start, end).subscribe({
      next: (response:any) => {
        if (response.success) {
          this.revenueBySource = response.data.revenueBySource || [];
          this.initSourceBreakdownChart();
        }
      },
      error: (error:any) => {
        console.error('Error loading revenue by source:', error);
        this.generateRevenueBySource();
      }
    });
  }

  loadRevenueByRoomType(): void {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    this.reportService.getRevenueByRoomType(start, end).subscribe({
      next: (response:any) => {
        if (response.success) {
          this.revenueByRoomType = response.data.revenueByRoomType || [];
          this.initRoomTypeChart();
        }
      },
      error: (error:any) => {
        console.error('Error loading revenue by room type:', error);
        this.generateRevenueByRoomType();
      }
    });
  }

  updateKPIs(): void {
    this.kpis[0].value = this.stats.totalRevenue;
    this.kpis[1].value = this.stats.averageDailyRate;
    this.kpis[2].value = this.stats.revPAR;
    this.kpis[3].value = this.stats.trevPAR;
    this.kpis[0].change = this.stats.growthVsLastPeriod;
    this.kpis[1].change = 8.3;
    this.kpis[2].change = 10.2;
    this.kpis[3].change = 11.8;
  }

  generateRevenueBySource(): void {
    if (!this.revenueBySource.length && this.stats.totalRevenue > 0) {
      this.revenueBySource = [
        { source: 'Direct Booking', amount: this.stats.totalRevenue * 0.35, percentage: 35, color: '#10b981' },
        { source: 'Booking.com', amount: this.stats.totalRevenue * 0.25, percentage: 25, color: '#3b82f6' },
        { source: 'Expedia', amount: this.stats.totalRevenue * 0.15, percentage: 15, color: '#8b5cf6' },
        { source: 'Agoda', amount: this.stats.totalRevenue * 0.10, percentage: 10, color: '#f59e0b' },
        { source: 'Travel Agent', amount: this.stats.totalRevenue * 0.10, percentage: 10, color: '#ef4444' },
        { source: 'Corporate', amount: this.stats.totalRevenue * 0.05, percentage: 5, color: '#06b6d4' }
      ];
    }
  }

  generateRevenueByRoomType(): void {
    if (!this.revenueByRoomType.length && this.stats.totalRevenue > 0) {
      this.revenueByRoomType = [
        { roomType: 'Deluxe', revenue: this.stats.totalRevenue * 0.42, percentage: 42, adr: 85000, occupancyRate: 78 },
        { roomType: 'Executive', revenue: this.stats.totalRevenue * 0.28, percentage: 28, adr: 150000, occupancyRate: 72 },
        { roomType: 'Presidential', revenue: this.stats.totalRevenue * 0.18, percentage: 18, adr: 450000, occupancyRate: 45 },
        { roomType: 'Lagoon View', revenue: this.stats.totalRevenue * 0.12, percentage: 12, adr: 120000, occupancyRate: 68 }
      ];
    }
  }

  setFallbackData(): void {
    this.generateRevenueData();
    this.generateRevenueBySource();
    this.generateRevenueByRoomType();
    this.calculateStats();
    this.updateKPIs();
    this.updateCharts();
  }

  generateRevenueData(): void {
    const data: any[] = [];
    const days = this.getDaysInRange();

    for (let i = 0; i < days; i++) {
      const date = new Date(this.startDate);
      date.setDate(date.getDate() + i);

      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const multiplier = isWeekend ? 1.3 : 1;

      const baseRevenue = 800000;
      const roomRevenue = Math.round(baseRevenue * multiplier * (0.7 + Math.random() * 0.2));
      const fbRevenue = Math.round(roomRevenue * 0.25);
      const spaRevenue = Math.round(roomRevenue * 0.08);
      const otherRevenue = Math.round(roomRevenue * 0.05);

      data.push({
        date: date.toISOString().split('T')[0],
        roomRevenue: roomRevenue,
        fbRevenue: fbRevenue,
        spaRevenue: spaRevenue,
        otherRevenue: otherRevenue,
        totalRevenue: roomRevenue + fbRevenue + spaRevenue + otherRevenue
      });
    }

    this.revenueData = data;
    this.stats.totalRevenue = data.reduce((sum, d) => sum + d.totalRevenue, 0);
  }

  calculateStats(): void {
    const totalRevenue = this.stats.totalRevenue;
    const totalRoomNights = this.revenueData.reduce((sum, d) => sum + (d.roomRevenue / 85000), 0);
    const totalRooms = 250;

    this.stats.averageDailyRate = totalRoomNights > 0 ? totalRevenue / totalRoomNights : 0;
    this.stats.revPAR = totalRooms > 0 ? totalRevenue / totalRooms : 0;
    this.stats.trevPAR = totalRooms > 0 ? (totalRevenue * 1.2) / totalRooms : 0;
    this.stats.projectedRevenue = totalRevenue * 1.12;
    this.stats.growthVsLastPeriod = 12.5;
  }

  getDaysInRange(): number {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  initCharts(): void {
    this.initRevenueTrendChart();
    this.initSourceBreakdownChart();
    this.initRoomTypeChart();
  }

  updateCharts(): void {
    if (this.revenueTrendChart) {
      this.revenueTrendChart.destroy();
    }
    if (this.sourceBreakdownChart) {
      this.sourceBreakdownChart.destroy();
    }
    if (this.roomTypeChart) {
      this.roomTypeChart.destroy();
    }
    this.initCharts();
  }

  initRevenueTrendChart(): void {
    const canvas = document.getElementById('revenueTrendChart') as HTMLCanvasElement;
    if (!canvas) return;

    const labels = this.getChartLabels();
    const roomRevenue = this.revenueData.map(d => d.roomRevenue);
    const fbRevenue = this.revenueData.map(d => d.fbRevenue);
    const spaRevenue = this.revenueData.map(d => d.spaRevenue);
    const otherRevenue = this.revenueData.map(d => d.otherRevenue);

    this.revenueTrendChart = new Chart(canvas, {
      type: this.chartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Room Revenue',
            data: roomRevenue,
            borderColor: '#c49a6c',
            backgroundColor: this.chartType === 'bar' ? '#c49a6c' : 'rgba(196, 154, 108, 0.1)',
            borderWidth: 2,
            fill: this.chartType === 'line',
            tension: 0.4
          },
          {
            label: 'F&B Revenue',
            data: fbRevenue,
            borderColor: '#3b82f6',
            backgroundColor: this.chartType === 'bar' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: this.chartType === 'line',
            tension: 0.4
          },
          {
            label: 'Spa Revenue',
            data: spaRevenue,
            borderColor: '#10b981',
            backgroundColor: this.chartType === 'bar' ? '#10b981' : 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            fill: this.chartType === 'line',
            tension: 0.4
          },
          {
            label: 'Other Revenue',
            data: otherRevenue,
            borderColor: '#f59e0b',
            backgroundColor: this.chartType === 'bar' ? '#f59e0b' : 'rgba(245, 158, 11, 0.1)',
            borderWidth: 2,
            fill: this.chartType === 'line',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                label += `₦${(context.raw as number).toLocaleString()}`;
                return label;
              }
            }
          },
          legend: { position: 'bottom' }
        },
        scales: {
          y: {
            title: { display: true, text: 'Revenue (₦)' },
            ticks: { callback: (value) => `₦${(Number(value) / 1000000).toFixed(1)}M` }
          }
        }
      }
    });
  }

  initSourceBreakdownChart(): void {
    const canvas = document.getElementById('sourceBreakdownChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.sourceBreakdownChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: this.revenueBySource.map(s => s.source),
        datasets: [{
          data: this.revenueBySource.map(s => s.amount),
          backgroundColor: this.revenueBySource.map(s => s.color),
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw as number;
                const percentage = ((value / this.stats.totalRevenue) * 100).toFixed(1);
                return `${label}: ₦${value.toLocaleString()} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  initRoomTypeChart(): void {
    const canvas = document.getElementById('roomTypeChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.roomTypeChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.revenueByRoomType.map(r => r.roomType),
        datasets: [
          {
            label: 'Revenue (₦)',
            data: this.revenueByRoomType.map(r => r.revenue),
            backgroundColor: '#c49a6c',
            borderRadius: 8,
            yAxisID: 'y'
          },
          {
            label: 'ADR (₦)',
            data: this.revenueByRoomType.map(r => r.adr),
            backgroundColor: '#3b82f6',
            borderRadius: 8,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                if (context.dataset.label === 'Revenue (₦)') {
                  return `₦${(context.raw as number).toLocaleString()}`;
                }
                return `₦${(context.raw as number).toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          y: {
            title: { display: true, text: 'Revenue (₦)' },
            ticks: { callback: (value) => `₦${(Number(value) / 1000000).toFixed(1)}M` }
          },
          y1: {
            position: 'right',
            title: { display: true, text: 'ADR (₦)' },
            ticks: { callback: (value) => `₦${(value).toLocaleString()}` }
          }
        }
      }
    });
  }

  getChartLabels(): string[] {
    switch(this.reportType) {
      case 'daily':
        return this.revenueData.map(d => {
          const date = new Date(d.date);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });
      case 'weekly':
        const weeks = Math.ceil(this.revenueData.length / 7);
        return Array.from({ length: weeks }, (_, i) => `Week ${i + 1}`);
      case 'monthly':
        const months = new Set(this.revenueData.map(d => new Date(d.date).getMonth()));
        return Array.from(months).map(m => new Date(2024, m, 1).toLocaleString('default', { month: 'short' }));
      case 'yearly':
        const years = new Set(this.revenueData.map(d => new Date(d.date).getFullYear()));
        return Array.from(years).map(y => y.toString());
      default:
        return this.revenueData.map(d => {
          const date = new Date(d.date);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });
    }
  }

  onDateRangeChange(): void {
    this.loadData();
  }

  onReportTypeChange(): void {
    this.loadData();
  }

  onChartTypeChange(): void {
    this.initRevenueTrendChart();
  }

  exportData(): void {
    this.toastr.info('Export functionality will be implemented soon', 'Coming Soon');
  }

  formatCurrency(value: number): string {
    return `₦${value.toLocaleString()}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getPeakDay(): string {
    if (!this.revenueData.length) return 'N/A';
    const peak = this.revenueData.reduce((max, d) => d.totalRevenue > max.totalRevenue ? d : max, this.revenueData[0]);
    return this.formatDate(peak.date);
  }

  getPeakDate(): string {
    if (!this.revenueData.length) return 'N/A';
    const peak = this.revenueData.reduce((max, d) => d.totalRevenue > max.totalRevenue ? d : max, this.revenueData[0]);
    return this.formatDate(peak.date);
  }

  getPeakRevenue(): number {
    if (!this.revenueData.length) return 0;
    return Math.max(...this.revenueData.map(d => d.totalRevenue));
  }

  getWeekendRevenuePercentage(): number {
    const weekendRevenue = this.revenueData.reduce((sum, d) => {
      const date = new Date(d.date);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      return sum + (isWeekend ? d.totalRevenue : 0);
    }, 0);
    const weekdayRevenue = this.revenueData.reduce((sum, d) => {
      const date = new Date(d.date);
      const isWeekday = date.getDay() !== 0 && date.getDay() !== 6;
      return sum + (isWeekday ? d.totalRevenue : 0);
    }, 0);

    return weekendRevenue > 0 && weekdayRevenue > 0 ? ((weekendRevenue / weekdayRevenue) - 1) * 100 : 0;
  }
}
