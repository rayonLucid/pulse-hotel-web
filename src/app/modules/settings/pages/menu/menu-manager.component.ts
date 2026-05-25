import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Subject, takeUntil, combineLatest } from 'rxjs';

import { MenuCategory, MenuItem, MenuRolePermission } from '../../../../core/models/menu.model';
import { MenuService } from '../../../../core/services/Menu.service';
import { MenuTreeNodeComponent } from '../../components/menu-tree-node/menu-tree-node.component';
import { ToastrService } from 'ngx-toastr';
import { Role } from '../../../../core/models/roles.model';
import { RoleService } from '../../../../core/services/role.service';

@Component({
  selector: 'app-menu-manager',
  imports: [CommonModule, FormsModule,MenuTreeNodeComponent],
  templateUrl: './menu-manager.component.html',
  styleUrls: ['./menu-manager.component.scss'],
  standalone: true
})
export class MenuManagerComponent implements OnInit, OnDestroy {
  categories: MenuCategory[] = [];
  allMenuItems: MenuItem[] = [];
  rolePermissions: MenuRolePermission[] = [];
  hierarchicalMenuItems: MenuItem[] = [];

  selectedCategoryId: number | null = null;
  selectedMenuItem: MenuItem | null = null;
  availableRoles: Role[] = [];

  isLoading = false;
  showMenuItemModal = false;
  showCategoryModal = false;
  isChildExpanded =false
  isEditing = false;
  cdr =inject(ChangeDetectorRef);
  roleService = inject(RoleService)
  menuItemForm: Partial<MenuItem> = {
    menuTitle: '',
    menuIcon: '',
    routerLink: null,
    urlPath: null,
    isActive: true,
    isVisible: true,
    target: '_self',
    parentMenuItemId: null,
    menuOrder: 0,
    permissionKey: null
  };

  categoryForm: Partial<MenuCategory> = {
    categoryName: '',
    categoryIcon: 'fas fa-folder',
    isActive: true,
    displayOrder: 0
  };

  private destroy$ = new Subject<void>();


  constructor(public menuService: MenuService, private toaStr: ToastrService) {}

  ngOnInit(): void {
    this.loadData();
    this.loadRoles();
   // this.setupSubscriptions();
  }
  loadRoles() {
    this.roleService.getAll().subscribe({
      next: (roles: any) => {
        this.availableRoles = roles.data;
      },
      error: (err: any) => {
        console.error('Error loading roles:', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    // Subscribe to categories
    this.menuService.categories$
       .pipe(takeUntil(this.destroy$))
      .subscribe((categories:any) => {
       //  console.log('Categories updated:', this.categories);
        this.categories = categories.sort((a:any, b:any) => a.displayOrder - b.displayOrder);

      });

    // Subscribe to menu items
    this.menuService.menuItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe((items:any) => {
        this.allMenuItems = items;
        this.buildMenuHierarchy();
      });

    // Subscribe to permissions
    this.menuService.permissions$
      .pipe(takeUntil(this.destroy$))
      .subscribe((permissions:any)  => {
        this.rolePermissions = permissions;
      });
  }

  private loadData(): void {
    this.isLoading = true;
    combineLatest([
      this.menuService.getCategories(),
      this.menuService.getMenuItems(),
      this.menuService.getRolePermissions()
    ]).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.categories = this.menuService.categoriesSubject.value.sort((a:any, b:any) => a.displayOrder - b.displayOrder);
      //  console.log('Categories loaded:', this.categories);
        this.allMenuItems = this.menuService.menuItemsSubject.value;
      //  console.log('Menu items loaded:', this.allMenuItems);
        this.rolePermissions = this.menuService.permissionsSubject.value;
      //  console.log('Permissions:', this.rolePermissions);
        this.buildMenuHierarchy();
        this.isLoading = false;
        this.cdr.detectChanges()
      },
      error: (err) => {
        console.error('Error loading:', err);
          this.toaStr.error(err.error.message, 'Error');
        this.isLoading = false;
         this.cdr.detectChanges()
         this.loadData()
      }
    });
  }

  private buildMenuHierarchy(): void {
    // Group menu items by category
  //  console.log('Building menu hierarchy with categories:', this.allMenuItems);
    this.categories.forEach(category => {
    //   console.log(this.allMenuItems);
      const categoryItems = this.allMenuItems.filter(item => item.categoryId === category.categoryId);
    //  console.log(categoryItems);
      category.menuItems = this.menuService.buildMenuTree(categoryItems);
       // console.log('Building menu hierarchy with categories:',  category.menuItems);

    });
  }

  selectCategory(categoryId: number): void {
    this.selectedCategoryId = categoryId;
     this.selectedMenuItem = null;
     this.isChildExpanded =false
     this.cdr.detectChanges()

  }

  selectMenuItem(menuItem: MenuItem): void {
 // console.log(menuItem);
    console.log('Selected menu item:', this.selectedMenuItem);
    // if parentId is null and has children expand
    if(menuItem.parentMenuItemId == null && menuItem.children != undefined && menuItem.children?.length >0){
      this.isChildExpanded =true
       this.selectedMenuItem =null
       this.cdr.detectChanges()
    }
    // if parentId is not null and has no children collapse
  if(menuItem.parentMenuItemId == null && menuItem.children != undefined && menuItem.children?.length ==0){
      this.isChildExpanded =false
       this.selectedMenuItem =menuItem
    }
    // if parentId is not null then it is a child select it
    if(menuItem.parentMenuItemId != null && menuItem.children !=undefined && menuItem.children?.length ==0){
      this.isChildExpanded =true
       this.selectedMenuItem =menuItem
    }
    console.log('Selected menu item:', this.selectedMenuItem);
  }

  getSelectedCategoryName(): string {
    const category = this.categories.find(c => c.categoryId === this.selectedCategoryId);
    return category?.categoryName || '';
  }

  getMenuItemsForSelectedCategory(): MenuItem[] {
    if (!this.selectedCategoryId) return [];
console.log( this.categories)
    const category = this.categories.find(c => c.categoryId === this.selectedCategoryId);
    console.log(category)
    return category?.menuItems || [];
  }

  openCreateCategoryModal(): void {
    this.isEditing = false;
    this.categoryForm = {
      categoryName: '',
      categoryIcon: 'fas fa-folder',
      isActive: true,
      displayOrder: this.categories.length
    };
    this.showCategoryModal = true;
  }

  openEditCategoryModal(category: MenuCategory): void {
    this.isEditing = true;
    this.categoryForm = { ...category };
    this.showCategoryModal = true;
  }
// In menu-manager.component.ts
closeModals(): void {
  this.showCategoryModal = false;
  this.showMenuItemModal = false;
  this.resetForms();
}
  saveCategory(): void {
    if (this.isEditing && this.categoryForm.categoryId) {
      this.menuService.updateCategory(this.categoryForm.categoryId, this.categoryForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showCategoryModal = false;
            this.resetForms();
          },
          error: (err) => console.error('Error updating category:', err)
        });
    } else {
      this.menuService.createCategory(this.categoryForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showCategoryModal = false;
            this.resetForms();
          },
          error: (err) => console.error('Error creating category:', err)
        });
    }
  }

  deleteCategory(categoryId: number): void {
    if (confirm('Are you sure you want to delete this category? All menu items in this category will also be deleted.')) {
      this.menuService.deleteCategory(categoryId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            if (this.selectedCategoryId === categoryId) {
              this.selectedCategoryId = null;
            }
          },
          error: (err) => console.error('Error deleting category:', err)
        });
    }
  }

  openCreateMenuItemModal(): void {
    this.isEditing = false;
    this.menuItemForm = {
      menuTitle: '',
      menuIcon: '',
      routerLink: null,
      urlPath: null,
      isActive: true,
      isVisible: true,
      target: '_self',
      parentMenuItemId: null,
      menuOrder: this.getNextMenuOrder(),
      permissionKey: null,
      categoryId: this.selectedCategoryId || undefined
    };
    this.showMenuItemModal = true;
  }

  openEditMenuItemModal(menuItem: MenuItem): void {
    this.isEditing = true;
    this.menuItemForm = { ...menuItem };
    this.showMenuItemModal = true;
  }

  saveMenuItem(): void {
    if (this.isEditing && this.menuItemForm.menuItemId) {
      this.menuService.updateMenuItem(this.menuItemForm.menuItemId, this.menuItemForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showMenuItemModal = false;
            this.resetForms();
          },
          error: (err) => console.error('Error updating menu item:', err)
        });
    } else {
      this.menuService.createMenuItem(this.menuItemForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showMenuItemModal = false;
            this.resetForms();
          },
          error: (err) => console.error('Error creating menu item:', err)
        });
    }
  }

  deleteMenuItem(menuItemId: number): void {
    if (confirm('Are you sure you want to delete this menu item?')) {
      this.menuService.deleteMenuItem(menuItemId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            if (this.selectedMenuItem?.menuItemId === menuItemId) {
              this.selectedMenuItem = null;
            }
          },
          error: (err) => console.error('Error deleting menu item:', err)
        });
    }
  }

  toggleMenuItemStatus(menuItem: MenuItem): void {
    this.menuService.toggleMenuItemStatus(menuItem.menuItemId, !menuItem.isActive)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          menuItem.isActive = updated.isActive;
        },
        error: (err) => console.error('Error toggling menu item status:', err)
      });
  }

  onCategoryDrop(event: CdkDragDrop<MenuCategory[]>): void {
    moveItemInArray(this.categories, event.previousIndex, event.currentIndex);
    const updates = this.categories.map((cat, index) => ({
      categoryId: cat.categoryId,
      displayOrder: index
    }));

    this.menuService.bulkUpdateMenuOrder(updates as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => console.error('Error updating category order:', err)
      });
  }

  onMenuItemDrop(event: CdkDragDrop<MenuItem[]>, categoryId: number): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      const updates = event.container.data.map((item: MenuItem, index: number) => ({
        menuItemId: item.menuItemId,
        menuOrder: index
      }));

      this.menuService.bulkUpdateMenuOrder(updates)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          error: (err) => console.error('Error updating menu order:', err)
        });
    }
  }

  getNextMenuOrder(): number {
    if (!this.selectedCategoryId) return 0;
    const categoryItems = this.allMenuItems.filter(i => i.categoryId === this.selectedCategoryId);
    return categoryItems.length;
  }

  getParentMenuItems(): MenuItem[] {
    if (!this.selectedCategoryId) return [];
    return this.allMenuItems.filter(i => i.categoryId === this.selectedCategoryId && !i.parentMenuItemId);
  }

  getPermissionForMenuItem(menuItemId: number, roleName: string): MenuRolePermission | undefined {

    return this.rolePermissions.find(p => p.menuItemId === menuItemId && p.roleName === roleName);
  }

  updateRolePermission(menuItemId: number, roleName: string, field: 'canView' | 'canAccess', event: any): void {
    const value = event.target.checked;
    const permission = this.getPermissionForMenuItem(menuItemId, roleName);

    if (permission) {
      this.menuService.updateRolePermission(permission.menuRolePermissionId, { [field]: value })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          error: (err) => console.error('Error updating permission:', err)
        });
    } else {
      const newPermission = {
        menuItemId,
        roleName,
        canView: field === 'canView' ? value : false,
        canAccess: field === 'canAccess' ? value : false,
        createdAt: new Date().toISOString()
      };
      this.menuService.createRolePermission(newPermission)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          error: (err) => console.error('Error creating permission:', err)
        });
    }
  }

  private resetForms(): void {
    this.menuItemForm = {
      menuTitle: '',
      menuIcon: '',
      routerLink: null,
      urlPath: null,
      isActive: true,
      isVisible: true,
      target: '_self',
      parentMenuItemId: null,
      menuOrder: 0,
      permissionKey: null
    };
    this.categoryForm = {
      categoryName: '',
      categoryIcon: 'fas fa-folder',
      isActive: true,
      displayOrder: 0
    };
  }
}
