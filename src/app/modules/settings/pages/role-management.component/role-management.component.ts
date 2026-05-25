import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Role } from '../../../../core/models/roles.model';
import { RoleService } from '../../../../core/services/role.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';


@Component({
  selector: 'app-role-management',
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.scss',
  imports: [FormsModule, ReactiveFormsModule,CommonModule,NgxPaginationModule],
  standalone: true
})
export class RoleManagementComponent implements OnInit {
  roles: Role[] = [];
  selectedRole: Role | null = null;
  isEditing = false;
  roleForm!: FormGroup;
displayModal=false;
   currentPage = 1;
  itemsPerPage = 6;
  cdr = inject(ChangeDetectorRef)
  constructor(
    private fb: FormBuilder,
    private roleService: RoleService
  ) {
    this.roleForm = this.fb.group({
      roleName: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.roleService.getAll().subscribe(
      {
        next: (res:any) =>{ this.roles = res.data;
      this.cdr.detectChanges()
     },
     error: (err) => console.error('Error loading roles:', err)
    }
    );
  }
 onPageChange(page: number) {
    this.currentPage = page;
  }
  openCreateModal() {
    this.isEditing = false;
    this.displayModal =true
    this.selectedRole = null;
    this.roleForm.reset({ roleName: '', description: '', isActive: true });
  }

  openEditModal(role: Role) {
    this.isEditing = true;
     this.displayModal =true
    this.selectedRole = role;
    this.roleForm.patchValue({
      roleName: role.roleName,
      description: role.description || '',
      isActive: role.isActive
    });
  }

  saveRole() {
    if (this.roleForm.invalid) return;

    const formValue = this.roleForm.value;

    if (this.isEditing && this.selectedRole) {
      this.roleService.update(this.selectedRole.roleId, formValue).subscribe(() => {
        this.loadRoles();
        this.selectedRole = null;
      });
    } else {
      this.roleService.create(formValue).subscribe(() => this.loadRoles());
    }
  }

  deleteRole(id: number) {
    if (confirm('Delete this role?')) {
      this.roleService.delete(id).subscribe(() => this.loadRoles());
    }
  }
}
