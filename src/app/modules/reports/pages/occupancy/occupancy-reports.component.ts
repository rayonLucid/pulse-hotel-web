// src/app/modules/reports/pages/occupancy/occupancy-reports.component.ts
import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

import { ToastrService } from 'ngx-toastr';
import { ReportService } from '../../../../core/services/report';
Chart.register(...registerables);

@Component({
  selector: 'app-occupancy-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './occupancy-reports.component.html',
  styleUrls: ['./occupancy-reports.component.scss']
})
export class OccupancyReportsComponent implements OnInit, AfterViewInit {
  // Date Range
  startDate: string = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];

  // View Type
  viewType: 'daily' | 'weekly' | 'monthly' = 'daily';
  chartType: 'line' | 'bar' = 'line';

  // Charts
  occupancyChart: Chart | null = null;
  roomTypeChart: Chart | null = null;
  forecastChart: Chart | null = null;

  // Data
  occupancyData: any[] = [];
  roomTypeData: any[] = [];
  forecastData: any[] = [];

  // Stats
  stats = {
    averageOccupancy: 0,
    peakOccupancy: 0,
    lowestOccupancy: 0,
    totalRoomNights: 0,
    adr: 0,
    revpar: 0
  };

  // Filters
  selectedRoomType: string = 'all';
  roomTypes: string[] = ['All Room Types', 'Deluxe', 'Executive', 'Presidential', 'Lagoon View'];

  // Forecast Period
  forecastDays: number = 30;

  // Loading states
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

    Promise.all([
      this.loadOccupancyDetails(start, end),
      this.loadOccupancyForecast()
    ]).finally(() => {
      this.isLoading = false;
      this.updateCharts();
    });
  }

  loadOccupancyDetails(startDate: Date, endDate: Date): Promise<void> {
    return new Promise((resolve) => {
      this.reportService.getOccupancyDetails(startDate, endDate).subscribe({
        next: (response:any) => {
          if (response.success) {
            this.occupancyData = response.data.dailyBreakdown || this.generateOccupancyData();
            this.roomTypeData = response.data.byRoomType || this.generateRoomTypeData();
            this.stats.averageOccupancy = response.data.summary?.occupancyRate || 0;
            this.stats.peakOccupancy = Math.max(...this.occupancyData.map(d => d.occupancyRate));
            this.stats.lowestOccupancy = Math.min(...this.occupancyData.map(d => d.occupancyRate));
            this.stats.totalRoomNights = this.occupancyData.reduce((sum, d) => sum + d.occupied, 0);
            this.stats.adr = response.data.summary?.adr || 0;
            this.stats.revpar = response.data.summary?.revpar || 0;
          }
          resolve();
        },
        error: (error:any) => {
          console.error('Error loading occupancy details:', error);
          this.setFallbackOccupancyData();
          resolve();
        }
      });
    });
  }

  loadOccupancyForecast(): Promise<void> {
    return new Promise((resolve) => {
      this.reportService.getOccupancyForecast(this.forecastDays).subscribe({
        next: (response:any) => {
          if (response.success) {
            this.forecastData = response.data.forecast || this.generateForecastData();
          }
          resolve();
        },
        error: (error:any) => {
          console.error('Error loading occupancy forecast:', error);
          this.generateForecastData();
          resolve();
        }
      });
    });
  }

  setFallbackOccupancyData(): void {
    this.generateOccupancyData();
    this.generateRoomTypeData();
    this.calculateFallbackStats();
  }

  generateOccupancyData(): any[] {
    const data: any[] = [];
    const days = this.getDaysInRange();

    for (let i = 0; i < days; i++) {
      const date = new Date(this.startDate);
      date.setDate(date.getDate() + i);

      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseOccupancy = isWeekend ? 85 : 75;
      const variance = Math.random() * 10 - 5;
      const occupancyRate = Math.min(100, Math.max(50, baseOccupancy + variance));
      const occupied = Math.round((occupancyRate / 100) * 250);

      data.push({
        date: date.toISOString().split('T')[0],
        occupied: occupied,
        available: 250,
        occupancyRate: Math.round(occupancyRate)
      });
    }

    return data;
  }

  generateRoomTypeData(): any[] {
    return [
      { roomType: 'Deluxe', totalRooms: 120, occupied: 98, occupancyRate: 81.7, adr: 85000 },
      { roomType: 'Executive', totalRooms: 60, occupied: 52, occupancyRate: 86.7, adr: 150000 },
      { roomType: 'Presidential', totalRooms: 20, occupied: 15, occupancyRate: 75.0, adr: 450000 },
      { roomType: 'Lagoon View', totalRooms: 50, occupied: 42, occupancyRate: 84.0, adr: 120000 }
    ];
  }

  generateForecastData(): any[] {
    const data = [];
    for (let i = 1; i <= this.forecastDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const expected = isWeekend ? 88 : 78;
      const optimistic = Math.min(100, expected + 12);
      const pessimistic = Math.max(50, expected - 10);

      data.push({
        date: date.toISOString().split('T')[0],
        expected: expected,
        optimistic: optimistic,
        pessimistic: pessimistic
      });
    }
    return data;
  }

  calculateFallbackStats(): void {
    this.stats.averageOccupancy = this.occupancyData.reduce((sum, d) => sum + d.occupancyRate, 0) / this.occupancyData.length;
    this.stats.peakOccupancy = Math.max(...this.occupancyData.map(d => d.occupancyRate));
    this.stats.lowestOccupancy = Math.min(...this.occupancyData.map(d => d.occupancyRate));
    this.stats.totalRoomNights = this.occupancyData.reduce((sum, d) => sum + d.occupied, 0);
    this.stats.adr = 85000;
    this.stats.revpar = 66750;
  }

  getDaysInRange(): number {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  initCharts(): void {
    this.initOccupancyChart();
    this.initRoomTypeChart();
    this.initForecastChart();
  }

  updateCharts(): void {
    if (this.occupancyChart) this.occupancyChart.destroy();
    if (this.roomTypeChart) this.roomTypeChart.destroy();
    if (this.forecastChart) this.forecastChart.destroy();
    this.initCharts();
  }

  initOccupancyChart(): void {
    const canvas = document.getElementById('occupancyChart') as HTMLCanvasElement;
    if (!canvas) return;

    const labels = this.occupancyData.map(d => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    const data = this.occupancyData.map(d => d.occupancyRate);

    this.occupancyChart = new Chart(canvas, {
      type: this.chartType,
      data: {
        labels: labels,
        datasets: [{
          label: 'Occupancy Rate (%)',
          data: data,
          borderColor: '#c49a6c',
          backgroundColor: this.chartType === 'bar' ? '#c49a6c' : 'rgba(196, 154, 108, 0.1)',
          borderWidth: 2,
          fill: this.chartType === 'line',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (context) => `${context.raw}%` } }
        },
        scales: {
          y: { title: { display: true, text: 'Occupancy Rate (%)' }, min: 0, max: 100, ticks: { callback: (value) => `${value}%` } }
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
        labels: this.roomTypeData.map(r => r.roomType),
        datasets: [
          { label: 'Occupancy Rate (%)', data: this.roomTypeData.map(r => r.occupancyRate), backgroundColor: '#c49a6c', borderRadius: 8, yAxisID: 'y' },
          { label: 'ADR (₦)', data: this.roomTypeData.map(r => r.adr / 1000), backgroundColor: '#3b82f6', borderRadius: 8, yAxisID: 'y1' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context:any) => context.dataset.label === 'Occupancy Rate (%)' ? `${context.raw}%` : `₦${(context.raw * 1000).toLocaleString()}`
            }
          }
        },
        scales: {
          y: { title: { display: true, text: 'Occupancy Rate (%)' }, min: 0, max: 100, ticks: { callback: (value:any) => `${value}%` } },
          y1: { position: 'right', title: { display: true, text: 'ADR (₦)' }, ticks: { callback: (value:any) => `₦${(value * 1000).toLocaleString()}` } }
        }
      }
    });
  }

  initForecastChart(): void {
    const canvas = document.getElementById('forecastChart') as HTMLCanvasElement;
    if (!canvas) return;

    const labels = this.forecastData.slice(0, 14).map(f => {
      const date = new Date(f.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    this.forecastChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: 'Expected', data: this.forecastData.slice(0, 14).map(f => f.expected), borderColor: '#c49a6c', borderWidth: 2 },
          { label: 'Optimistic', data: this.forecastData.slice(0, 14).map(f => f.optimistic), borderColor: '#10b981', borderWidth: 2, borderDash: [5, 5] },
          { label: 'Pessimistic', data: this.forecastData.slice(0, 14).map(f => f.pessimistic), borderColor: '#ef4444', borderWidth: 2, borderDash: [5, 5] }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${context.raw}%` } } },
        scales: { y: { title: { display: true, text: 'Occupancy Rate (%)' }, min: 0, max: 100, ticks: { callback: (value) => `${value}%` } } }
      }
    });
  }

  onDateRangeChange(): void {
    this.loadData();
  }

  onViewTypeChange(): void {
    this.loadData();
  }

  onChartTypeChange(): void {
    this.initOccupancyChart();
  }

  exportData(): void {
    this.toastr.info('Export functionality will be implemented soon', 'Coming Soon');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getDayOfWeek(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  }

  getPeakForecast(): number {
    if (!this.forecastData.length) return 0;
    return Math.max(...this.forecastData.slice(0, 14).map(f => f.optimistic));
  }

  getAverageForecast(): number {
    if (!this.forecastData.length) return 0;
    const sum = this.forecastData.slice(0, 14).reduce((s, f) => s + f.expected, 0);
    return Math.round(sum / 14);
  }

  getTrendDirection(): string {
    if (this.forecastData.length < 2) return 'Stable';
    const first = this.forecastData[0].expected;
    const last = this.forecastData[this.forecastData.length - 1].expected;
    if (last > first) return 'Increasing';
    if (last < first) return 'Decreasing';
    return 'Stable';
  }
}
