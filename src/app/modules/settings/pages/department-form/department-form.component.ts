// department-form.component.ts
import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Department } from '../../../../core/models/ department.model';
import { DepartmentService } from '../../../../core/services/department';
import { AuthService } from '../../../../core/auth/auth.service';
import { Staff } from '../../../../core/models/staff.model';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.scss']
})
export class DepartmentFormComponent implements OnInit {
  @Input() department: Department | null = null;
  @Output() close = new EventEmitter<boolean>();

  private fb = inject(FormBuilder);
  private deptService = inject(DepartmentService);
private cdr = inject(ChangeDetectorRef);
userService =inject(AuthService);
toastService =inject(ToastrService)
  form!: FormGroup;
  parentDepartments: Department[] = [];
  managingStaff: Staff[] = [];
  loading = false;
  isEdit = false;

  ngOnInit(): void {
    this.isEdit = !!this.department;
    // this.loadParentList();
    this.loadManagingStaff();
    this.initForm();
  }

  loadManagingStaff(): void {
    this.deptService.getManagingStaff().subscribe({
      next: (response) => {
        console.log('Managing staff response:', response);
        this.managingStaff = response.data
        this.cdr.markForCheck();
      },
      error: (err) => console.error(err)
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      departmentName: [this.department?.departmentName || '', [Validators.required, Validators.maxLength(100)]],
      description: [this.department?.description || ''],
      managerId: [this.department?.managerId || null],
    //  sortOrder: [this.department?.sortOrder || 0],
      isActive: [this.department?.isActive ?? true]
    });
  }

  // loadParentList(): void {
  //   this.deptService.getDepartments(true).subscribe({
  //     next: (list) => {
  //       // Exclude current department from parent list to prevent self-parent
  //       this.parentDepartments = list.filter(d => !this.department || d.departmentId !== this.department?.departmentId);
  //     },
  //     error: (err) => console.error(err)
  //   });
  // }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const data = this.form.value;
    const request = this.isEdit
      ? this.deptService.updateDepartment(this.department!.departmentId, data)
      : this.deptService.createDepartment(data);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.close.emit(true);
      },
      error: (err) => {
        console.error(err.error.message);
        this.loading = false;
        this.cdr.detectChanges()
      //  alert('Save failed: ' + err.message);
         // console.log('Save failed: ' + err.message)
          this.toastService.error(err.error.message)
      }
    });
  }
}
