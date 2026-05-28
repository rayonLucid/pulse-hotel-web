import { Department } from "./ department.model";

export interface MenuCategory {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  menuItems?: MenuItem[];
}

export interface MenuItem {
  menuItemId: number;
  parentMenuItemId: number | null;
  menuTitle: string;
  menuIcon: string;
  routerLink: string | null;
  urlPath: string | null;
  menuOrder: number;
  isActive: boolean;
  isVisible: boolean;
  target: string | null;
  permissionKey: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  categoryId: number;
  children?: MenuItem[];

}
export interface MenuDepartmentPermission {
  menuDeptPermissionId: number;
  menuItemId: number;
  departmentId: number;
  urlPath:string
  canView: boolean;
  canAccess: boolean;
  createdAt: Date | string; // Use Date if instantiated locally, string if raw JSON from API
  parentMenuItemId:number;
  categoryId:number;
  // Navigation properties (Optional, as they are typically lazy-loaded or omitted in shallow payloads)
  menuItem?: MenuItem;
  department?: Department;
}
export interface MenuRolePermission {
  menuRolePermissionId: number;
  menuItemId: number;
  roleName: string;
  canView: boolean;
  canCreate:boolean;
  canEdit:boolean;
  canApprove:boolean;
  canAccess: boolean;
  createdAt: string;
}

// export interface MenuItem {
//   menuItemId?: number;
//   parentMenuItemId?: number | null;
//   menuTitle?: string;
//   menuIcon: string;
//   routerLink: string |null;
//   isActive: boolean;
//   isVisible: boolean;
//   urlPath: string | null;
//   menuOrder: number;
//   target: string;
//   permissionKey?: string | null;
//   children?: MenuItem[];
// }

export interface UserMenu {
  menus: MenuItem[];
  pinnedMenus: MenuItem[];
  recentMenus: MenuItem[];
}
