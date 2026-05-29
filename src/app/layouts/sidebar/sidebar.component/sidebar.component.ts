// src/app/layouts/sidebar/sidebar.component.ts
import { Component, OnInit, Output, EventEmitter, Inject, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MenuItem } from '../../../core/models/menu.model';
import { MenuService } from '../../../core/services/Menu.service';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Output() sidebarToggled = new EventEmitter<boolean>();

  menus: MenuItem[] = [];
  pinnedMenus: MenuItem[] = [];
  isCollapsed = false;
  openSubmenus: Set<number> = new Set();

  private menuService = inject(MenuService)
     authService = inject(AuthService)
   private  changeDet = inject(ChangeDetectorRef)
   toastService = inject(ToastrService)
  constructor(
    public router: Router

  ) {}

  ngOnInit(): void {
    // Load collapsed state from localStorage
    const savedState = localStorage.getItem('sidebar_collapsed');

   // console.log('Saved sidebar:', savedState);
    this.isCollapsed = savedState === 'true';
   // console.log('Initial sidebar collapsed:', this.isCollapsed);
    this.sidebarToggled.emit(this.isCollapsed);

    this.loadMenus();

  }

  loadMenus(): void {
    this.menuService.loadUserMenus().subscribe({
      next: (userMenu:any) => {
   //    console.log('User menus loaded:', userMenu.data.menus);
        this.menus = userMenu.data.menus;
       // console.log('Menus set in component:', this.menus);
        this.pinnedMenus = userMenu.data.pinnedMenus;
         this.changeDet.detectChanges();
        // this.toastService.success('Menus loaded successfully', 'Success');
       // console.log('Pinned menus set in component:', this.pinnedMenus);
      },
      error: (error:any) => {
        console.error('Error loading menus:', error);
       // this.toastService.error('Failed to load menus. Please try again.', 'Menu Loading Error');
        this.loadMenus()
      }
    });
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('sidebar_collapsed', String(this.isCollapsed));
    this.sidebarToggled.emit(this.isCollapsed);
  }

  toggleSubmenu(menu: MenuItem): void {
    if (this.openSubmenus.has(menu.menuItemId)) {
      this.openSubmenus.delete(menu.menuItemId);
    } else {
      this.openSubmenus.add(menu.menuItemId);
    }
  }

  isSubmenuOpen(menu: MenuItem): boolean {
    return this.openSubmenus.has(menu.menuItemId);
  }

  isMenuActive(menu: MenuItem): boolean {
    if (menu.routerLink) {
      return this.router.url === menu.routerLink || this.router.url.startsWith(menu.routerLink + '/');
    }
    return false;
  }

  isChildActive(menu: MenuItem): boolean {
    if (menu.children) {
      return menu.children.some((child:any) => this.isMenuActive(child));
    }
    return false;
  }

  logMenuClick(menu: MenuItem): void {
    this.menuService.logMenuAccess(menu.menuItemId).subscribe();
  }

  unpinMenu(menu: MenuItem, event: Event): void {
    event.stopPropagation();
    this.menuService.unpinMenuItem(menu.menuItemId).subscribe(() => {
      this.loadMenus();
    });
  }

  getUserRole(): string {
    return this.authService.getUserRole() || 'Guest';
  }
}
