// src/app/core/services/menu.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface MenuItem {
  menuItemId: number;
  parentMenuItemId: number | null;
  menuTitle: string;
  menuIcon: string;
  routerLink: string;
  urlPath: string;
  menuOrder: number;
  target: string;
  permissionKey: string;
  children?: MenuItem[];
}

export interface UserMenu {
  menus: MenuItem[];
  pinnedMenus: MenuItem[];
  recentMenus: MenuItem[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = environment.apiUrl;
  private menusSubject = new BehaviorSubject<MenuItem[]>([]);
  public menus$ = this.menusSubject.asObservable();

  private pinnedMenusSubject = new BehaviorSubject<MenuItem[]>([]);
  public pinnedMenus$ = this.pinnedMenusSubject.asObservable();

  constructor(private http: HttpClient) {}

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
    return this.http.post(`${this.apiUrl}/menus/pin`, { menuItemId, isPinned: true }).pipe(
      tap(() => this.loadUserMenus().subscribe())
    );
  }

  /**
   * Unpin a menu item
   */
  unpinMenuItem(menuItemId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/menus/unpin`, { menuItemId }).pipe(
      tap(() => this.loadUserMenus().subscribe())
    );
  }

  /**
   * Log menu access (for recent menus)
   */
  logMenuAccess(menuItemId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/menus/log-access`, { menuItemId });
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
