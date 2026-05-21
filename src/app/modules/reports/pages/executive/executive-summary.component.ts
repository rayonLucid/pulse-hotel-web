// src/app/modules/reports/pages/executive/executive-summary.component.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

import { ToastrService } from 'ngx-toastr';
import { ReportService } from '../../../../core/services/report';
Chart.register(...registerables);

@Component({
  selector: 'app-executive-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './executive-summary.component.html',
  styleUrls: ['./executive-summary.component.scss']
})
export class ExecutiveSummaryComponent implements OnInit, AfterViewInit {
  // Date Range
  startDate: string = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];
  compareWith: 'previous_period' | 'previous_year' = 'previous_period';

  // Charts
  revenueChart: Chart | null = null;
  kpiChart: Chart | null = null;
  sourceChart: Chart | null = null;

  // Executive Data
  executiveData: any = null;
  kpis: any = {};
  highlights: any = {};
  charts: any = {};
  recommendations: string[] = [];

  // Loading state
  isLoading = false;
  currentDate = new Date();

  constructor(
    private reportService: ReportService,
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

    this.reportService.getExecutiveSummary(start, end).subscribe({
      next: (response:any) => {
        if (response.success) {
          this.executiveData = response.data;
          this.kpis = response.data.kpis || this.getDefaultKPIs();
          this.highlights = response.data.highlights || this.getDefaultHighlights();
          this.charts = response.data.charts || this.getDefaultCharts();
          this.recommendations = response.data.recommendations || this.getDefaultRecommendations();
        }
        this.isLoading = false;
        this.updateCharts();
      },
      error: (error:any) => {
        console.error('Error loading executive summary:', error);
        this.setFallbackData();
        this.isLoading = false;
        this.updateCharts();
      }
    });
  }

  setFallbackData(): void {
    this.kpis = this.getDefaultKPIs();
    this.highlights = this.getDefaultHighlights();
    this.charts = this.getDefaultCharts();
    this.recommendations = this.getDefaultRecommendations();
  }

  getDefaultKPIs(): any {
    return {
      occupancyRate: 78.5,
      adr: 85000,
      revpar: 66750,
      gop: 8325000,
      gopMargin: 45,
      totalRevenue: 18500000,
      guestSatisfaction: 4.6,
      marketShare: 18.5
    };
  }

  getDefaultHighlights(): any {
    return {
      achievements: [
        'Revenue up 12.5% year-over-year',
        'Guest satisfaction increased to 4.6',
        'Market share grew by 2.3%',
        'Occupancy rate improved by 5.2%'
      ],
      challenges: [
        'Labor costs increased by 8%',
        'New competitor opening Q3',
        'Seasonal demand fluctuations'
      ],
      opportunities: [
        'Corporate segment growing 15% annually',
        'Weekend packages showing 25% uptake',
        'Loyalty program members +30%'
      ],
      risks: [
        'Economic uncertainty in H2',
        'Exchange rate volatility',
        'Supply chain disruptions'
      ]
    };
  }

  getDefaultCharts(): any {
    return {
      revenueTrend: 'Upward',
      occupancyTrend: 'Stable',
      sourceMix: 'Direct 35%, OTA 45%, Corporate 20%',
      guestSatisfaction: 'Excellent'
    };
  }

  getDefaultRecommendations(): string[] {
    return [
      'Increase marketing spend on corporate segment',
      'Implement dynamic pricing for weekends',
      'Launch loyalty program enhancements',
      'Optimize OTA commission structure'
    ];
  }

  initCharts(): void {
    this.initRevenueChart();
    this.initKPIChart();
    this.initSourceChart();
  }

  updateCharts(): void {
    if (this.revenueChart) this.revenueChart.destroy();
    if (this.kpiChart) this.kpiChart.destroy();
    if (this.sourceChart) this.sourceChart.destroy();
    this.initCharts();
  }

  initRevenueChart(): void {
    const canvas = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.revenueChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Current Year',
            data: [12500000, 13200000, 14800000, 16500000, 17200000, 18500000, 19500000, 20200000, 18800000, 19200000, 21000000, 22500000],
            borderColor: '#c49a6c',
            backgroundColor: 'rgba(196, 154, 108, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Previous Year',
            data: [11200000, 11800000, 13200000, 14500000, 15200000, 16200000, 17000000, 17800000, 16500000, 16800000, 18200000, 19500000],
            borderColor: '#9ca3af',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
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
              label: (context) => `${context.dataset.label}: ₦${(context.raw as number).toLocaleString()}`
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

  initKPIChart(): void {
    const canvas = document.getElementById('kpiChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.kpiChart = new Chart(canvas, {
      type: 'radar',
      data: {
        labels: ['Occupancy', 'ADR', 'RevPAR', 'GOP Margin', 'Guest Satisfaction', 'Market Share'],
        datasets: [
          {
            label: 'Current Period',
            data: [78.5, 85, 66.8, 45, 92, 18.5],
            borderColor: '#c49a6c',
            backgroundColor: 'rgba(196, 154, 108, 0.2)',
            borderWidth: 2
          },
          {
            label: 'Industry Average',
            data: [72, 82, 59, 42, 88, 15],
            borderColor: '#9ca3af',
            backgroundColor: 'rgba(156, 163, 175, 0.2)',
            borderWidth: 2,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.raw}${context.label === 'Guest Satisfaction' ? '%' : context.label === 'ADR' || context.label === 'RevPAR' ? 'K' : '%'}`
            }
          },
          legend: { position: 'bottom' }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 20 }
          }
        }
      }
    });
  }

  initSourceChart(): void {
    const canvas = document.getElementById('sourceChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.sourceChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Direct Booking', 'OTA', 'Corporate', 'Travel Agent'],
        datasets: [{
          data: [35, 45, 15, 5],
          backgroundColor: ['#c49a6c', '#3b82f6', '#10b981', '#f59e0b'],
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
                return `${label}: ${value}%`;
              }
            }
          }
        }
      }
    });
  }

  onDateRangeChange(): void {
    this.loadData();
  }

  onCompareChange(): void {
    this.loadData();
  }

  exportData(): void {
    this.toastr.info('Export functionality will be implemented soon', 'Coming Soon');
  }

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `₦${(value / 1000000).toFixed(1)}M`;
    }
    return `₦${value.toLocaleString()}`;
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  formatNumber(value: number): string {
    return value.toLocaleString();
  }

  getTrendClass(trend: number): string {
    return trend >= 0 ? 'positive' : 'negative';
  }

  getTrendIcon(trend: number): string {
    return trend >= 0 ? 'arrow-up' : 'arrow-down';
  }
}
