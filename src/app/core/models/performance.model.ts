// src/app/core/models/performance.model.ts
export interface PerformanceReview {
  reviewId: number;
  staffId: number;
  staffName: string;
  reviewerId: number;
  reviewerName: string;
  reviewPeriodStart: Date;
  reviewPeriodEnd: Date;
  reviewDate: Date;
  overallRating: number;
  strengths: string;
  areasForImprovement: string;
  goalsForNextPeriod: string;
  promotionRecommended: boolean;
  salaryIncreaseRecommended: boolean;
  salaryIncreasePercentage?: number;
  status: 'Draft' | 'Submitted' | 'Acknowledged';
  staffComments?: string;
  acknowledgementDate?: Date;
  createdAt: Date;
}

export interface PerformanceMetric {
  metricId: number;
  metricName: string;
  category: string;
  weight: number;
  target: number;
  actual: number;
  score: number;
  comments?: string;
}

export interface PerformanceDashboard {
  totalReviews: number;
  averageRating: number;
  pendingReviews: number;
  reviewsByRating: { rating: number; count: number }[];
  topPerformers: PerformanceReview[];
  recentReviews: PerformanceReview[];
}

export interface CreatePerformanceReview {
  staffId: number;
  reviewPeriodStart: Date;
  reviewPeriodEnd: Date;
  overallRating: number;
  strengths: string;
  areasForImprovement: string;
  goalsForNextPeriod: string;
  promotionRecommended: boolean;
  salaryIncreaseRecommended: boolean;
  salaryIncreasePercentage?: number;
}
