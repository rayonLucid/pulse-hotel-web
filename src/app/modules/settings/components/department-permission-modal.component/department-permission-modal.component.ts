import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';

import { Subject, takeUntil } from 'rxjs';
import { DepartmentService } from '../../../../core/services/department';
import { MenuService } from '../../../../core/services/Menu.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';

export interface MenuItemPermission {
  menuItemId: number;
  menuName: string;
  canView: boolean;
  canAccess: boolean;
}

@Component({
  selector: 'app-department-permission-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: `./department-permission-modal.component.html`,
  styleUrl: `./department-permission-modal.component.scss`
})
export class DepartmentPermissionModalComponent implements OnInit, OnDestroy {
  @Input() department: any; // { departmentId, departmentName }
  @Output() close = new EventEmitter<boolean>();

  private fb = inject(FormBuilder);
  private deptService = inject(DepartmentService);
  private menuService = inject(MenuService);
  private destroy$ = new Subject<void>();
  toastService =inject(ToastrService)
cdr =inject(ChangeDetectorRef);
  permissionsForm!: FormGroup;
  loading = false;
  private menuNames: string[] = [];
  UrlPaths!: (string | null)[];

  get permissionsArray(): FormArray {
    return this.permissionsForm.get('permissions') as FormArray;
  }

  ngOnInit(): void {
    this.permissionsForm = this.fb.group({
      permissions: this.fb.array([])
    });
    this.loadPermissions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPermissions(): void {
    if (!this.department) return;
    this.loading = true;

    this.menuService.getActiveMenus().pipe(takeUntil(this.destroy$)).subscribe({
      next: (menus) => {
        this.menuNames = menus.map(m => m.menuTitle);
          this.UrlPaths = menus.map(m => m.urlPath);
        // initialize FormArray with empty controls (will be patched after permissions load)
        this.permissionsArray.clear();
        menus.forEach(() => this.permissionsArray.push(this.createPermissionGroup(false, false,0)));

        // fetch existing permissions
        this.deptService.getDepartmentPermissions(this.department.departmentId).pipe(takeUntil(this.destroy$)).subscribe({
          next: (permissions) => {
            console.log(permissions,"data permission")
            // patch values
            if(permissions.length > 0){
            menus.forEach((menu, idx) => {
              const perm = permissions.find(p => p.menuItemId === menu.menuItemId);
            //  console.log(perm)
              const group = this.permissionsArray.at(idx) as FormGroup;
              group.patchValue({
                menuItemId:perm?.menuItemId,
                canView: perm?.canView || false,
                canAccess: perm?.canAccess || false
              });
                this.cdr.detectChanges()
            });
          }
            this.loading = false;
              this.cdr.detectChanges()
          },
          error: (err) => {
            console.error(err,"Loading Error");
            this.loading = false;
            this.cdr.detectChanges()
            this.toastService.error(err,"Error")
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
           this.cdr.detectChanges()
            this.toastService.error(err.message || err.error.message,"Error")
      }
    });
  }

  createPermissionGroup(canView: boolean, canAccess: boolean,menuItemId:number): FormGroup {
    return this.fb.group({
      menuItemId:menuItemId,
      canView: [canView],
      canAccess: [canAccess]
    });
  }

  getMenuName(index: number): string {
    return this.menuNames[index] || 'Unknown';
  }
  getMenuUrl(index: number): string {
    return this.UrlPaths[index] || 'Module';
  }

   IsModule(index: number): string {
    return this.menuNames[index] || 'Unknown';
  }

  savePermissions(): void {
    if (!this.department) return;
    this.loading = true;

    // Reconstruct payload with menuItemIds
    const permissions = this.permissionsArray.value;
    // const payload = permissions.map((p: any, idx: number) => ({
    //   menuItemId: this.getMenuItemId(idx), // need to store menuItemIds separately
    //   canView: p.canView,
    //   canAccess: p.canAccess
    // }));
//console.log(permissions)
    this.deptService.saveDepartmentPermissions(this.department.departmentId, permissions).subscribe({
      next: () => {
        this.loading = false;
        this.close.emit(true);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.toastService.error(err.error|| 'Failed to save permissions');
      }
    });
  }

  // Helper to get menuItemId by index (store during load)
  private menuItemIds: number[] = [];

  // Modify loadPermissions to store menuItemIds
  // (add this line inside the subscribe where menus are received:)
  // this.menuItemIds = menus.map(m => m.menuItemId);

  getMenuItemId(index: number): number {
    return this.menuItemIds[index] || 0;
  }

  closeModal(): void {
    this.close.emit(false);
  }
}
