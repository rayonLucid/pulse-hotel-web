// src/app/modules/staff/pages/performance/performance.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { StaffService } from '../../../../core/services/staff.service';
import { PerformanceReview, PerformanceDashboard, PerformanceMetric, CreatePerformanceReview } from '../../../../core/models/performance.model';
import { Staff } from '../../../../core/models/staff.model';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.scss']
})
export class PerformanceComponent implements OnInit {
  dashboard: PerformanceDashboard | null = null;
  reviews: PerformanceReview[] = [];
  staff: Staff[] = [];
  selectedReview: PerformanceReview | null = null;
  metrics: PerformanceMetric[] = [];
  showCreateModal = false;
  showReviewModal = false;
  showAcknowledgeModal = false;
  isLoading = true;
  isSaving = false;
  selectedTab: 'dashboard' | 'reviews' | 'new' = 'dashboard';

  // Filters
  selectedStaffId: number | null = null;
  selectedStatus: string = '';

  // Review Form
  reviewForm: FormGroup;

  // Metric Templates
  metricTemplates: PerformanceMetric[] = [
    { metricId: 0, metricName: 'Job Knowledge', category: 'Core', weight: 20, target: 5, actual: 0, score: 0 },
    { metricId: 0, metricName: 'Quality of Work', category: 'Core', weight: 20, target: 5, actual: 0, score: 0 },
    { metricId: 0, metricName: 'Productivity', category: 'Core', weight: 15, target: 5, actual: 0, score: 0 },
    { metricId: 0, metricName: 'Attendance & Punctuality', category: 'Core', weight: 10, target: 5, actual: 0, score: 0 },
    { metricId: 0, metricName: 'Communication Skills', category: 'Soft Skills', weight: 10, target: 5, actual: 0, score: 0 },
    { metricId: 0, metricName: 'Teamwork', category: 'Soft Skills', weight: 10, target: 5, actual: 0, score: 0 },
    { metricId: 0, metricName: 'Problem Solving', category: 'Core', weight: 10, target: 5, actual: 0, score: 0 },
    { metricId: 0, metricName: 'Customer Service', category: 'Core', weight: 5, target: 5, actual: 0, score: 0 }
  ];

  constructor(
    private staffService: StaffService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.reviewForm = this.fb.group({
      staffId: ['', Validators.required],
      reviewPeriodStart: ['', Validators.required],
      reviewPeriodEnd: ['', Validators.required],
      overallRating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
      strengths: ['', Validators.required],
      areasForImprovement: ['', Validators.required],
      goalsForNextPeriod: ['', Validators.required],
      promotionRecommended: [false],
      salaryIncreaseRecommended: [false],
      salaryIncreasePercentage: [0]
    });
  }

  ngOnInit(): void {
    this.loadDashboard();
    this.loadReviews();
    this.loadStaff();
  }

  loadDashboard(): void {
    this.staffService.getPerformanceDashboard().subscribe({
      next: (response) => {
        if (response.success) {
          this.dashboard = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
      }
    });
  }

  loadReviews(): void {
    this.isLoading = true;
    this.staffService.getPerformanceReviews(this.selectedStaffId || undefined, this.selectedStatus || undefined).subscribe({
      next: (response) => {
        if (response.success) {
          this.reviews = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.isLoading = false;
      }
    });
  }

  loadStaff(): void {
    this.staffService.getStaff({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.staff = response.data;
      },
      error: (error) => {
        console.error('Error loading staff:', error);
      }
    });
  }

  applyFilters(): void {
    this.loadReviews();
  }

  clearFilters(): void {
    this.selectedStaffId = null;
    this.selectedStatus = '';
    this.loadReviews();
  }

  openCreateModal(): void {
    this.reviewForm.reset({
      staffId: '',
      reviewPeriodStart: '',
      reviewPeriodEnd: '',
      overallRating: 0,
      strengths: '',
      areasForImprovement: '',
      goalsForNextPeriod: '',
      promotionRecommended: false,
      salaryIncreaseRecommended: false,
      salaryIncreasePercentage: 0
    });
    this.metrics = JSON.parse(JSON.stringify(this.metricTemplates));
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  calculateOverallRating(): void {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    this.metrics.forEach(metric => {
      if (metric.actual > 0) {
        metric.score = (metric.actual / metric.target) * metric.weight;
        totalWeightedScore += metric.score;
        totalWeight += metric.weight;
      }
    });

    const overallRating = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 5 : 0;
    this.reviewForm.patchValue({ overallRating: Math.round(overallRating * 10) / 10 });
  }

  updateMetric(metric: PerformanceMetric, value: number): void {
    metric.actual = value;
    this.calculateOverallRating();
  }

  createReview(): void {
    if (this.reviewForm.invalid) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    this.isSaving = true;
    const reviewData: CreatePerformanceReview = this.reviewForm.value;

    this.staffService.createPerformanceReview(reviewData).subscribe({
      next: (response:any) => {
        if (response.success) {
          this.toastr.success('Performance review created successfully', 'Success');
          this.closeCreateModal();
          this.loadReviews();
          this.loadDashboard();
        } else {
          this.toastr.error(response.message || 'Creation failed', 'Error');
        }
        this.isSaving = false;
      },
      error: (error) => {
        this.isSaving = false;
        this.toastr.error(error.message || 'Failed to create review', 'Error');
      }
    });
  }

  viewReview(review: PerformanceReview): void {
    this.selectedReview = review;
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.selectedReview = null;
  }

  openAcknowledgeModal(review: PerformanceReview): void {
    this.selectedReview = review;
    this.showAcknowledgeModal = true;
  }

  closeAcknowledgeModal(): void {
    this.showAcknowledgeModal = false;
    this.selectedReview = null;
  }

  acknowledgeReview(): void {
    if (!this.selectedReview) return;

    this.isSaving = true;
    this.staffService.acknowledgePerformanceReview(this.selectedReview.reviewId).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success('Performance review acknowledged', 'Success');
          this.closeAcknowledgeModal();
          this.loadReviews();
          this.loadDashboard();
        } else {
          this.toastr.error(response.message || 'Acknowledgement failed', 'Error');
        }
        this.isSaving = false;
      },
      error: (error) => {
        this.isSaving = false;
        this.toastr.error(error.message || 'Failed to acknowledge', 'Error');
      }
    });
  }

  getRatingClass(rating: number): string {
    if (rating >= 4.5) return 'rating-excellent';
    if (rating >= 3.5) return 'rating-good';
    if (rating >= 2.5) return 'rating-average';
    if (rating >= 1.5) return 'rating-poor';
    return 'rating-bad';
  }

  getRatingText(rating: number): string {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Good';
    if (rating >= 2.5) return 'Average';
    if (rating >= 1.5) return 'Poor';
    return 'Very Poor';
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'Draft': return 'status-draft';
      case 'Submitted': return 'status-submitted';
      case 'Acknowledged': return 'status-acknowledged';
      default: return '';
    }
  }
}
