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

export interface MenuRolePermission {
  menuRolePermissionId: number;
  menuItemId: number;
  roleName: string;
  canView: boolean;
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
