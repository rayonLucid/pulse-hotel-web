// src/app/modules/reports/pages/staff/staff-reports.component.ts
import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

import { ToastrService } from 'ngx-toastr';
import { ReportService } from '../../../../core/services/report';
Chart.register(...registerables);

@Component({
  selector: 'app-staff-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-reports.component.html',
  styleUrls: ['./staff-reports.component.scss']
})
export class StaffReportsComponent implements OnInit, AfterViewInit {
  // Date Range
  startDate: string = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];

  // View Type
  reportType: 'performance' | 'attendance' | 'productivity' = 'performance';

  // Charts
  performanceChart: Chart | null = null;
  departmentChart: Chart | null = null;
  attendanceChart: Chart | null = null;

  // Data
  staffPerformance: any[] = [];
  departmentSummary: any = null;
  attendanceSummary: any[] = [];
  productivity: any = null;

  // Stats
  stats = {
    totalStaff: 0,
    averageRating: 0,
    totalTasks: 0,
    completionRate: 0,
    attendanceRate: 0,
    overtimeHours: 0
  };

  // Departments for filter
  departments: string[] = ['All Departments', 'Front Desk', 'Housekeeping', 'Maintenance', 'F&B', 'Security'];
  selectedDepartment: string = 'All Departments';

  // Loading state
  isLoading = false;
  private reportService: ReportService = inject(ReportService);
  constructor(

    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }
// Add this method to the StaffReportsComponent class

getRatingClass(rating: number): string {
  if (rating >= 4.5) return 'rating-excellent';
  if (rating >= 3.5) return 'rating-good';
  if (rating >= 2.5) return 'rating-average';
  return 'rating-poor';
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
      this.loadPerformanceReport(start, end),
      this.loadAttendanceReport(start, end),
      this.loadProductivityReport(start, end)
    ]).finally(() => {
      this.isLoading = false;
      this.updateCharts();
      this.calculateStats();
    });
  }

  loadPerformanceReport(startDate: Date, endDate: Date): Promise<void> {
    return new Promise((resolve) => {
      this.reportService.getStaffPerformanceReport(startDate, endDate).subscribe({
        next: (response:any) => {
          if (response.success) {
            this.staffPerformance = response.data.staffPerformance || [];
            this.departmentSummary = response.data.departmentSummary;
          }
          resolve();
        },
        error: (error:any) => {
          console.error('Error loading performance report:', error);
          this.setFallbackPerformanceData();
          resolve();
        }
      });
    });
  }

  loadAttendanceReport(startDate: Date, endDate: Date): Promise<void> {
    return new Promise((resolve) => {
      this.reportService.getStaffAttendanceReport(startDate, endDate).subscribe({
        next: (response:any) => {
          if (response.success) {
            this.attendanceSummary = response.data.attendanceSummary || [];
          }
          resolve();
        },
        error: (error:any) => {
          console.error('Error loading attendance report:', error);
          this.setFallbackAttendanceData();
          resolve();
        }
      });
    });
  }

  loadProductivityReport(startDate: Date, endDate: Date): Promise<void> {
    return new Promise((resolve) => {
      this.reportService.getStaffProductivityReport(startDate, endDate).subscribe({
        next: (response:any) => {
          if (response.success) {
            this.productivity = response.data.productivity;
          }
          resolve();
        },
        error: (error:any) => {
          console.error('Error loading productivity report:', error);
          this.setFallbackProductivityData();
          resolve();
        }
      });
    });
  }

  setFallbackPerformanceData(): void {
    this.staffPerformance = [
      { staffName: 'John Doe', department: 'Front Desk', tasksCompleted: 145, completionRate: 94, averageRating: 4.8, attendanceDays: 22, lateDays: 1, overtimeHours: 5 },
      { staffName: 'Jane Smith', department: 'Housekeeping', tasksCompleted: 210, completionRate: 98, averageRating: 4.9, attendanceDays: 21, lateDays: 0, overtimeHours: 3 },
      { staffName: 'Mike Johnson', department: 'Maintenance', tasksCompleted: 89, completionRate: 88, averageRating: 4.2, attendanceDays: 20, lateDays: 2, overtimeHours: 8 }
    ];

    this.departmentSummary = {
      department: 'Overall',
      staffCount: 45,
      totalTasks: 1250,
      completionRate: 93.5,
      averageRating: 4.6,
      totalOvertime: 120
    };
  }

  setFallbackAttendanceData(): void {
    this.attendanceSummary = [
      { staffName: 'John Doe', present: 20, absent: 1, late: 1, leave: 0, attendanceRate: 95.2 },
      { staffName: 'Jane Smith', present: 21, absent: 0, late: 0, leave: 0, attendanceRate: 100 },
      { staffName: 'Mike Johnson', present: 18, absent: 2, late: 2, leave: 1, attendanceRate: 85.7 }
    ];
  }

  setFallbackProductivityData(): void {
    this.productivity = {
      roomsCleanedPerStaff: 12.5,
      checkInsPerFrontDesk: 45,
      revenuePerStaff: 1250000,
      costPerOccupiedRoom: 3500
    };
  }

  calculateStats(): void {
    this.stats.totalStaff = this.staffPerformance.length;
    this.stats.averageRating = this.staffPerformance.reduce((sum, s) => sum + s.averageRating, 0) / this.staffPerformance.length;
    this.stats.totalTasks = this.staffPerformance.reduce((sum, s) => sum + s.tasksCompleted, 0);
    this.stats.completionRate = this.staffPerformance.reduce((sum, s) => sum + s.completionRate, 0) / this.staffPerformance.length;
    this.stats.attendanceRate = this.attendanceSummary.reduce((sum, s) => sum + s.attendanceRate, 0) / this.attendanceSummary.length;
    this.stats.overtimeHours = this.staffPerformance.reduce((sum, s) => sum + s.overtimeHours, 0);
  }

  initCharts(): void {
    this.initPerformanceChart();
    this.initDepartmentChart();
    this.initAttendanceChart();
  }

  updateCharts(): void {
    if (this.performanceChart) this.performanceChart.destroy();
    if (this.departmentChart) this.departmentChart.destroy();
    if (this.attendanceChart) this.attendanceChart.destroy();
    this.initCharts();
  }

  initPerformanceChart(): void {
    const canvas = document.getElementById('performanceChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.performanceChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.staffPerformance.map(s => s.staffName),
        datasets: [
          { label: 'Completion Rate (%)', data: this.staffPerformance.map(s => s.completionRate), backgroundColor: '#c49a6c', borderRadius: 8 },
          { label: 'Rating', data: this.staffPerformance.map(s => s.averageRating), backgroundColor: '#3b82f6', borderRadius: 8 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  initDepartmentChart(): void {
    const canvas = document.getElementById('departmentChart') as HTMLCanvasElement;
    if (!canvas) return;

    const departmentData = this.staffPerformance.reduce((acc, s) => {
      if (!acc[s.department]) {
        acc[s.department] = { tasks: 0, count: 0 };
      }
      acc[s.department].tasks += s.tasksCompleted;
      acc[s.department].count++;
      return acc;
    }, {});

    const labels = Object.keys(departmentData);
    const data = labels.map(l => departmentData[l].tasks);

    this.departmentChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#c49a6c', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right' } }
      }
    });
  }

  initAttendanceChart(): void {
    const canvas = document.getElementById('attendanceChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.attendanceChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.attendanceSummary.map(s => s.staffName),
        datasets: [{
          label: 'Attendance Rate (%)',
          data: this.attendanceSummary.map(s => s.attendanceRate),
          borderColor: '#c49a6c',
          backgroundColor: 'rgba(196, 154, 108, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  onDateRangeChange(): void {
    this.loadData();
  }

  onReportTypeChange(): void {
    this.loadData();
  }

  onDepartmentFilter(): void {
    // Filter staff by department
    if (this.selectedDepartment !== 'All Departments') {
      // Apply filter logic
    }
  }

  exportData(): void {
    this.toastr.info('Export functionality will be implemented soon', 'Coming Soon');
  }

  formatCurrency(value: number): string {
    return `₦${value.toLocaleString()}`;
  }
}
