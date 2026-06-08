// src/app/layouts/sidebar/sidebar.component.ts
import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, inject, Input,OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MenuItem } from '../../../core/models/menu.model';
import { MenuService } from '../../../core/services/Menu.service';
import { ToastrService } from 'ngx-toastr';
import { retry, timer } from 'rxjs';



@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit ,OnChanges {
  @Output() sidebarToggled = new EventEmitter<boolean>();
@Input() isMobile = false;
@Input() isOpen = false;
isVisible = true; // Controls actual visibility of the sidebar
  menus: MenuItem[] = [];
  pinnedMenus: MenuItem[] = [];
  isCollapsed = false;
  openSubmenus: Set<number> = new Set();
isLoading=false
  private menuService = inject(MenuService)
     authService = inject(AuthService)
   private  changeDet = inject(ChangeDetectorRef)
   toastService = inject(ToastrService)
  constructor(
    public router: Router

  ) {}
NumberOfConnectionTries = 0;
  ngOnInit(): void {
    // Load collapsed state from localStorage
    const savedState = localStorage.getItem('sidebar_collapsed');

   // console.log('Saved sidebar:', savedState);
    this.isCollapsed = savedState === 'true';
   // console.log('Initial sidebar collapsed:', this.isCollapsed);
    this.sidebarToggled.emit(this.isCollapsed);

    this.loadMenus();

  }
private maxRetries = 3;
private retryCount = 0;

ngOnChanges(changes: SimpleChanges) {
 // console.log( this.isMobile, this.isOpen);
  if (this.isMobile) {
    this.isVisible = this.isOpen;
  } else {
    this.isVisible = true; // always visible on desktop
  }
}
closeSidebar(): void {
  if (this.isMobile) {
    this.isVisible = false;
    this.isOpen = false;
    this.sidebarToggled.emit(true); // emit collapsed state to parent
  }
}
loadMenus(): void {
  this.isLoading = true;

  this.menuService.loadUserMenus()
    .pipe(
      retry({
        count: this.maxRetries,
        delay: (error, retryCount) => {
          this.retryCount = retryCount;
          console.log(`Retry attempt ${retryCount} of ${this.maxRetries}`);
          return timer(1000); // wait 1 second between retries
        }
      })
    )
    .subscribe({
      next: (userMenu: any) => {
        const menus = userMenu?.data?.menus;
        if (!menus || menus.length === 0) {
          // No menus after all retries? Should not happen because retry would have exhausted.
          // Fallback: redirect.
          this.toastService.error('No menus assigned. Please contact administrator.', 'Access Denied');
          this.router.navigate(['/auth/login']);
          return;
        }
        this.menus = menus;
        this.pinnedMenus = userMenu.data.pinnedMenus || [];
        this.isLoading = false;
        this.changeDet.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load menus after retries:', error);
        this.toastService.error('Failed to load menus after multiple attempts.', 'Menu Loading Error');
        this.router.navigate(['/auth/login']).then(() => {
          // Stop any further processing
          this.isLoading = false;
          this.changeDet.detectChanges();
        });
      }
    });
}
  // loadMenus(): void {
  //     this.isLoading =true

  //   this.menuService.loadUserMenus().subscribe({
  //     next: (userMenu:any) => {

  //  //    console.log('User menus loaded:', userMenu.data.menus);
  //       this.menus = userMenu.data.menus;
  //      // console.log('Menus set in component:', this.menus);
  //       this.pinnedMenus = userMenu.data.pinnedMenus;
  //       if(this.menus.length ==0) {
  //         console.log('Pinned menus set in component:', this.pinnedMenus);
  //            this.isLoading =true
  //        this.changeDet.detectChanges();
  //        if(this.NumberOfConnectionTries <= 3){
  //          this.NumberOfConnectionTries++;
  //          this.loadMenus()
  //        }else{
  //           this.toastService.error('Failed to load menus after multiple attempts. Please login again.', 'Menu Loading Error');
  //         this.router.navigate(['/auth/login'])

  //        this.isLoading =false
  //        this.changeDet.detectChanges();
  //        }
  //       }else{
  //         this.isLoading =false
  //            this.changeDet.detectChanges();

  //       }

  //       // this.toastService.success('Menus loaded successfully', 'Success');
  //      // console.log('Pinned menus set in component:', this.pinnedMenus);

  //     },
  //     error: (error:any) => {
  //         this.isLoading =false
  //       console.error('Error loading menus:', this.NumberOfConnectionTries);
  //       this.toastService.error('Failed to load menus. Please try again.', 'Menu Loading Error');
  //        if(this.NumberOfConnectionTries <= 3){
  //          this.NumberOfConnectionTries++;
  //          this.loadMenus()
  //        }else{
  //         console.error('Error loading menus after multiple attempts:', error);
  //          this.router.navigate(['/auth/login'])
  //           this.toastService.error('Failed to load menus after multiple attempts. Please login again.', 'Menu Loading Error');
  //        this.isLoading =false
  //        this.changeDet.detectChanges();



  //        }
  //     }
  //   });
  // }

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
