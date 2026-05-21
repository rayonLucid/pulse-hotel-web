// src/app/core/services/menu.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MenuCategory, MenuItem, MenuRolePermission, UserMenu } from '../models/menu.model';
import { AppConfigService } from './app.config.service';



@Injectable({
  providedIn: 'root'
})
export class MenuService {
//  private apiUrl = environment.apiUrl;
  public menusSubject = new BehaviorSubject<MenuItem[]>([]);
  public menus$ = this.menusSubject.asObservable();

  private pinnedMenusSubject = new BehaviorSubject<MenuItem[]>([]);
  public pinnedMenus$ = this.pinnedMenusSubject.asObservable();

   categoriesSubject = new BehaviorSubject<MenuCategory[]>([]);
   menuItemsSubject = new BehaviorSubject<MenuItem[]>([]);
   permissionsSubject = new BehaviorSubject<MenuRolePermission[]>([]);

  categories$ = this.categoriesSubject.asObservable();
  menuItems$ = this.menuItemsSubject.asObservable();
  permissions$ = this.permissionsSubject.asObservable()

  private rootUrl = "";
  public apiUrl = '';
    constructor(private http: HttpClient,private readonly config:AppConfigService) {
  this.apiUrl = `${this.config.apiUrl}`;
  this.rootUrl = this.config.rootUrl;
    }

  /**
   * Load user menus from API
   */
public  loadUserMenus(): Observable<UserMenu> {
    return this.http.get<UserMenu>(`${this.apiUrl}/menu/user`).pipe(
      tap((userMenu:any) => {
       // console.log(userMenu.data)
        this.menusSubject.next(this.buildMenuHierarchy(userMenu.data.menus));
        this.pinnedMenusSubject.next(userMenu.data.pinnedMenus);
      })
    );
  }

  /**
   * Build hierarchical menu structure
   */
  private buildMenuHierarchy(menus: MenuItem[]): MenuItem[] {
    const menuMap = new Map<number, MenuItem>();
    const rootMenus: MenuItem[] = [];
//console.log(menus)
    // First, create a map of all menus
    menus.forEach(menu => {
      menuMap.set(menu.menuItemId, { ...menu, children: [] });
    });
    // console.log('Menu map created:', menuMap);
    // Then, build the hierarchy
    menus.forEach(menu => {
      const menuWithChildren = menuMap.get(menu.menuItemId)!;
      if (menu.parentMenuItemId && menuMap.has(menu.parentMenuItemId)) {
        const parent = menuMap.get(menu.parentMenuItemId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(menuWithChildren);
      } else {
        rootMenus.push(menuWithChildren);
      }
    });

    // Sort by menu order
    this.sortMenus(rootMenus);
 //   console.log('Hierarchical menus built:', rootMenus);
    return rootMenus;
  }

  private sortMenus(menus: MenuItem[]): void {
    menus.sort((a, b) => a.menuOrder - b.menuOrder);
    menus.forEach(menu => {
      if (menu.children && menu.children.length) {
        this.sortMenus(menu.children);
      }
    });
  }

  /**
   * Pin a menu item
   */
  pinMenuItem(menuItemId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/menu/pin`, { menuItemId, isPinned: true }).pipe(
      tap(() => this.loadUserMenus().subscribe())
    );
  }

  /**
   * Unpin a menu item
   */
  unpinMenuItem(menuItemId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/menu/unpin`, { menuItemId }).pipe(
      tap(() => this.loadUserMenus().subscribe())
    );
  }

    getCategories(): Observable<MenuCategory[]> {
    return this.http.get<MenuCategory[]>(`${this.apiUrl}/menu/admin/categories`).pipe(
      tap((categories:any) =>{
        this.categoriesSubject.next(categories.data)
//console.log('Categories loaded:',  this.categoriesSubject.value);
      })
    );
  }

  createCategory(category: Partial<MenuCategory>): Observable<MenuCategory> {
    return this.http.post<MenuCategory>(`${this.apiUrl}/menu/categories`, category).pipe(
      tap(newCategory => {
        const current = this.categoriesSubject.value;
        this.categoriesSubject.next([...current, newCategory]);
      })
    );
  }


   updateCategory(categoryId: number, category: Partial<MenuCategory>): Observable<MenuCategory> {
    return this.http.put<MenuCategory>(`${this.apiUrl}/categories/${categoryId}`, category).pipe(
      tap(updatedCategory => {
        const current = this.categoriesSubject.value;
        const index = current.findIndex(c => c.categoryId === categoryId);
        if (index !== -1) {
          current[index] = updatedCategory;
          this.categoriesSubject.next([...current]);
        }
      })
    );
  }

  deleteCategory(categoryId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${categoryId}`).pipe(
      tap(() => {
        const current = this.categoriesSubject.value;
        this.categoriesSubject.next(current.filter(c => c.categoryId !== categoryId));
      })
    );
  }

  updateCategoryOrder(categories: MenuCategory[]): Observable<void> {
    const updates = categories.map((cat, index) => ({
      categoryId: cat.categoryId,
      displayOrder: index
    }));
    return this.http.patch<void>(`${this.apiUrl}/categories/reorder`, { updates });
  }

  // Menu Items
  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/menu/admin/all`).pipe(
      tap((items:any) => {
      //  console.log('Menu items loaded:', items.data);
        this.menuItemsSubject.next(items.data)

      })
    );
  }

  getMenuItemsByCategory(categoryId: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/items/category/${categoryId}`);
  }


   createMenuItem(menuItem: Partial<MenuItem>): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.apiUrl}/items`, menuItem).pipe(
      tap(newItem => {
        const current = this.menuItemsSubject.value;
        this.menuItemsSubject.next([...current, newItem]);
      })
    );
  }

  updateMenuItem(menuItemId: number, menuItem: Partial<MenuItem>): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.apiUrl}/items/${menuItemId}`, menuItem).pipe(
      tap(updatedItem => {
        const current = this.menuItemsSubject.value;
        const index = current.findIndex(i => i.menuItemId === menuItemId);
        if (index !== -1) {
          current[index] = updatedItem;
          this.menuItemsSubject.next([...current]);
        }
      })
    );
  }

  deleteMenuItem(menuItemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${menuItemId}`).pipe(
      tap(() => {
        const current = this.menuItemsSubject.value;
        this.menuItemsSubject.next(current.filter(i => i.menuItemId !== menuItemId));
      })
    );
  }

  toggleMenuItemStatus(menuItemId: number, isActive: boolean): Observable<MenuItem> {
    return this.http.patch<MenuItem>(`${this.apiUrl}/items/${menuItemId}/toggle-status`, { isActive });
  }

  updateMenuItemOrder(menuItemId: number, menuOrder: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/items/${menuItemId}/order`, { menuOrder });
  }

  bulkUpdateMenuOrder(updates: { menuItemId: number; menuOrder: number }[]): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/items/bulk-order`, { updates });
  }

  // Role Permissions
  getRolePermissions(): Observable<MenuRolePermission[]> {
    return this.http.get<MenuRolePermission[]>(`${this.apiUrl}/menu/admin/role-permissions`).pipe(
      tap((permissions:any) => this.permissionsSubject.next(permissions.data))
    );
  }

  getPermissionsByMenuItem(menuItemId: number): Observable<MenuRolePermission[]> {
    return this.http.get<MenuRolePermission[]>(`${this.apiUrl}/role-permissions/menu-item/${menuItemId}`);
  }

  createRolePermission(permission: Partial<MenuRolePermission>): Observable<MenuRolePermission> {
    return this.http.post<MenuRolePermission>(`${this.apiUrl}/role-permissions`, permission).pipe(
      tap(newPermission => {
        const current = this.permissionsSubject.value;
        this.permissionsSubject.next([...current, newPermission]);
      })
    );
  }

  updateRolePermission(permissionId: number, updates: Partial<MenuRolePermission>): Observable<MenuRolePermission> {
    return this.http.patch<MenuRolePermission>(`${this.apiUrl}/role-permissions/${permissionId}`, updates).pipe(
      tap(updatedPermission => {
        const current = this.permissionsSubject.value;
        const index = current.findIndex(p => p.menuRolePermissionId === permissionId);
        if (index !== -1) {
          current[index] = updatedPermission;
          this.permissionsSubject.next([...current]);
        }
      })
    );
  }

  deleteRolePermission(permissionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/role-permissions/${permissionId}`).pipe(
      tap(() => {
        const current = this.permissionsSubject.value;
        this.permissionsSubject.next(current.filter(p => p.menuRolePermissionId !== permissionId));
      })
    );
  }

  // Helper method to build hierarchical tree
  buildMenuTree(items: MenuItem[], parentId: number | null = null): MenuItem[] {
    return items
      .filter(item => item.parentMenuItemId === parentId)
      .sort((a, b) => a.menuOrder - b.menuOrder)
      .map(item => ({
        ...item,
        children: this.buildMenuTree(items, item.menuItemId)
      }));
  }

  // Helper to flatten tree for API operations
  flattenMenuTree(items: MenuItem[]): MenuItem[] {
    let result: MenuItem[] = [];
    items.forEach(item => {
      result.push(item);
      if (item.children) {
        result = result.concat(this.flattenMenuTree(item.children));
      }
    });
    return result;
  }

  // Load all menu data
  loadAllMenuData(): Observable<[MenuCategory[], MenuItem[], MenuRolePermission[]]> {
    return this.http.get<[MenuCategory[], MenuItem[], MenuRolePermission[]]>(`${this.apiUrl}/all-data`);
  }

  // Refresh all data
  refreshAllData(): void {
    this.getCategories().subscribe();
    this.getMenuItems().subscribe();
    this.getRolePermissions().subscribe();
  }

  /**
   * Log menu access (for recent menus)
   */
  logMenuAccess(menuItemId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/menu/log-access`, { menuItemId });
  }

  /**
   * Search menus by title
   */
  searchMenus(searchTerm: string): MenuItem[] {
    const allMenus = this.menusSubject.value;
    return this.searchInMenus(allMenus, searchTerm.toLowerCase());
  }

  private searchInMenus(menus: MenuItem[], searchTerm: string): MenuItem[] {
    let results: MenuItem[] = [];
    menus.forEach(menu => {
      if (menu.menuTitle.toLowerCase().includes(searchTerm)) {
        results.push(menu);
      }
      if (menu.children && menu.children.length) {
        results = results.concat(this.searchInMenus(menu.children, searchTerm));
      }
    });
    return results;
  }

  /**
   * Get breadcrumb for current route
   */
  getBreadcrumb(routerLink: string): MenuItem[] {
    const breadcrumb: MenuItem[] = [];
    const findPath = (menus: MenuItem[], targetLink: string): boolean => {
      for (const menu of menus) {
        if (menu.routerLink === targetLink) {
          breadcrumb.push(menu);
          return true;
        }
        if (menu.children && menu.children.length) {
          if (findPath(menu.children, targetLink)) {
            breadcrumb.unshift(menu);
            return true;
          }
        }
      }
      return false;
    };

    findPath(this.menusSubject.value, routerLink);
    return breadcrumb;
  }
}
