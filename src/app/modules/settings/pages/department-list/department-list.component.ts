// department-list.component.ts
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentFormComponent } from '../department-form/department-form.component';
import { Department } from '../../../../core/models/ department.model';
import { DepartmentService } from '../../../../core/services/department';
import { NgxPaginationModule } from 'ngx-pagination';
import { DepartmentPermissionModalComponent } from '../../components/department-permission-modal/department-permission-modal.component';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DepartmentFormComponent,NgxPaginationModule,DepartmentPermissionModalComponent],
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss']
})
export class DepartmentListComponent implements OnInit {
  private deptService = inject(DepartmentService);
toastService = inject(ToastrService)
  // Data
  departments: Department[] = [];
  filteredDepartments: Department[] = [];
Math =Math;
  // Loading & UI
  loading = false;
  searchTerm = '';
  showInactive = false;
showPermissionModal = false;
selectedDepartment: any;
  // Modal
  showModal = false;
  editingDepartment: Department | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 6;
  totalItems = 0;
  totalPages = 0;
cdr = inject(ChangeDetectorRef);
  ngOnInit(): void {
    this.loadDepartments();
  }



openPermissionsModal(dept: any) {
  this.selectedDepartment = dept;
  this.showPermissionModal = true;
  this.cdr.detectChanges()
}

onPermissionModalClose(refresh: boolean) {
  this.showPermissionModal = false;
  this.cdr.detectChanges()
  if (refresh) this.loadDepartments();
}

  loadDepartments(): void {
    this.loading = true;
  //  console.log(this.showInactive)
    this.deptService.getDepartments(!this.showInactive).subscribe({
      next: (result: any) => {
       // console.log('API Response:', result);
        this.departments = result.data;
        this.applyFilterAndPagination();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.markForCheck();
       // this.loadDepartments();
      }
    });
  }

  applyFilterAndPagination(): void {
    // Filter
    let filtered = this.departments;
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.departmentName.toLowerCase().includes(term) ||
        (d.description && d.description.toLowerCase().includes(term))
      );
    }

    // Pagination
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    if (this.totalPages > 0 && this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.filteredDepartments = filtered.slice(start, end);
  }

  onSearch(): void {
    this.currentPage = 1; // reset to first page when searching
    this.applyFilterAndPagination();
  }

  toggleInactive(): void {
    this.showInactive =true
    this.currentPage = 1;
    this.loadDepartments();
  }

  // Pagination actions
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyFilterAndPagination();
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Modal & actions
  openCreateModal(): void {
    this.editingDepartment = null;
    this.showModal = true;
  }

  openEditModal(dept: Department): void {
    this.editingDepartment = { ...dept };
    this.showModal = true;
  }

  onModalClose(refresh = false): void {
    this.showModal = false;
      this.toastService.success("Record Saved Successfully","Success",{timeOut:3000})
    if (refresh) this.loadDepartments();
  }

  deleteDepartment(id: number, name: string): void {
    if (confirm(`Delete department "${name}"? This will soft-delete it.`)) {
      this.deptService.deleteDepartment(id).subscribe({
        next: () => this.loadDepartments(),
        error: (err) =>{
          console.log('Delete failed: ' + err.message)
          this.toastService.error(err.message)
        }
      });
    }
  }

  // getParentName(dept: Department): string {
  //   const parent = this.departments.find(d => d.departmentId === dept.parentDepartmentId);
  //   return parent ? parent.departmentName : '—';
  // }
}
