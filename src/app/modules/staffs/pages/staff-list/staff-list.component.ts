// src/app/modules/staff/pages/staff-list/staff-list.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StaffService } from '../../../../core/services/staff.service';
import { Staff, StaffStats } from '../../../../core/models/staff.model';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.scss']
})
export class StaffListComponent implements OnInit {
  staff: Staff[] = [];
  stats: StaffStats | null = null;
  isLoading = true;

  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalItems = 0;
  totalPages = 0;
  Math = Math;

  // Filters
  filters = {
    department: '',
    status: '',
    employmentType: '',
    searchTerm: ''
  };

  // Options
  departments: string[] = ['Front Desk', 'Housekeeping', 'Maintenance', 'Food & Beverage', 'Security', 'Administration', 'Sales & Marketing', 'Spa & Wellness'];
  employmentTypes: string[] = ['Full-Time', 'Part-Time', 'Contract', 'Casual'];
private changeDet =inject(ChangeDetectorRef);
  constructor(private staffService: StaffService) {}

  ngOnInit(): void {
    this.loadStaff();
    this.loadStats();
  }

  loadStaff(): void {
    this.isLoading = true;

    this.staffService.getStaff({
      page: this.currentPage,
      pageSize: this.pageSize,
      department: this.filters.department || undefined,
      employmentType: this.filters.employmentType || undefined,
      searchTerm: this.filters.searchTerm || undefined
    }).subscribe({
      next: (response) => {
        this.staff = response.data;
       // console.log('Loaded staff:', this.staff);
        this.totalItems = response.pagination.totalItems;
        this.totalPages = response.pagination.totalPages;
        this.isLoading = false;
        this.changeDet.detectChanges();
      },
      error: (error) => {
        console.error('Error loading :', error);
        this.isLoading = false;
        this.changeDet.detectChanges();
      }
    });
  }

  loadStats(): void {
    this.staffService.getStaffStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
          this.changeDet.detectChanges();
        //  console.log('Loaded stats:', this.stats);
        }
      },
      error: (error) => {
        console.error(' loading stats:', error);
        this.changeDet.detectChanges();
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadStaff();
  }

  clearFilters(): void {
    this.filters = {
      department: '',
      status: '',
      employmentType: '',
      searchTerm: ''
    };
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.department || this.filters.status || this.filters.employmentType || this.filters.searchTerm);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadStaff();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage: number;
    let endPage: number;

    if (this.totalPages <= maxVisible) {
      startPage = 1;
      endPage = this.totalPages;
    } else {
      if (this.currentPage <= Math.ceil(maxVisible / 2)) {
        startPage = 1;
        endPage = maxVisible;
      } else if (this.currentPage + Math.floor(maxVisible / 2) >= this.totalPages) {
        startPage = this.totalPages - maxVisible + 1;
        endPage = this.totalPages;
      } else {
        startPage = this.currentPage - Math.floor(maxVisible / 2);
        endPage = this.currentPage + Math.floor(maxVisible / 2);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getIntials(): string {
    const name = this.staff[0]?.firstName + ' ' + this.staff[0]?.lastName;
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
  }

  getRoleBadgeClass(role: string): string {
    const classes: { [key: string]: string } = {
      'Admin': 'badge-danger',
      'Manager': 'badge-warning',
      'Supervisor': 'badge-info',
      'Staff': 'badge-secondary'
    };
    return classes[role] || 'badge-secondary';
  }

    getStatusClass(isActive: boolean|undefined): string {
    return isActive ? 'badge-success' : 'badge-danger';
  }

  getStatusText(isActive: boolean|undefined): string {
    return isActive ? 'Active' : 'Inactive';
  }
}
