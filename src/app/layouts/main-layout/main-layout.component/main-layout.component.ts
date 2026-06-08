// src/app/layouts/main-layout/main-layout.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component/footer.component';
import { HeaderComponent } from '../../header/header.component/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component/sidebar.component';
import { Breadcrumb } from '../../../core/models/auth.models';
import { BreakpointObserver } from '@angular/cdk/layout';



@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,

    SidebarComponent,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  isSidebarCollapsed = false;
  isMobileMenuOpen = false;
  isMobile = false;
  showBackToTop = false;
  breadcrumbs: Breadcrumb[] = [];

  private resizeObserver: ResizeObserver | null = null;

  //constructor(private router: Router) {}
  constructor(private breakpointObserver: BreakpointObserver,private router: Router) {
  this.breakpointObserver.observe(['(max-width: 768px)']).subscribe(result => {
    this.isMobile = result.matches;
    if (!this.isMobile) {
      this.isMobileMenuOpen = false; // close menu on desktop resize
    }
  });
}


  ngOnInit(): void {
    this.checkScreenSize();
    this.setupResizeObserver();
    this.setupBreadcrumbs();
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.showBackToTop = window.scrollY > 300;
  }

  private checkScreenSize(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;

    if (wasMobile !== this.isMobile && this.isMobile) {
      this.isSidebarCollapsed = false;
      this.isMobileMenuOpen = false;
    }
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.checkScreenSize();
      });
      this.resizeObserver.observe(document.body);
    }
  }

  private setupBreadcrumbs(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.breadcrumbs = this.buildBreadcrumbs(this.router.url);
      }
    });
  }

  private buildBreadcrumbs(url: string): Breadcrumb[] {
    const segments = url.split('/').filter(s => s);
    const breadcrumbs: Breadcrumb[] = [];

    let currentPath = '';
    for (const segment of segments) {
      currentPath += `/${segment}`;
      breadcrumbs.push({
        label: this.formatBreadcrumbLabel(segment),
        path: currentPath
      });
    }

    return breadcrumbs;
  }

  private formatBreadcrumbLabel(segment: string): string {
    const labels: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'bookings': 'Bookings',
      'rooms': 'Rooms',
      'staff': 'Staff',
      'housekeeping': 'Housekeeping',
      'inventory': 'Inventory',
      'reports': 'Reports',
      'settings': 'Settings',
      'profile': 'Profile',
      'new': 'New',
      'detail': 'Details',
      'edit': 'Edit'
    };

    return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  }

  onSidebarToggle(collapsed: boolean): void {
  //  console.log("Sidebar collapsed:", collapsed);
    if (this.isMobile) {
     //  this.isSidebarCollapsed = collapsed;
      this.toggleMobileMenu();
    } else {
      this.isSidebarCollapsed = collapsed;
    }
  }

  toggleMobileMenu(): void {
    if (this.isMobile)  this.isMobileMenuOpen = !this.isMobileMenuOpen;
//console.log( this.isMobileMenuOpen); // Debug log to verify toggle state
    // Prevent body scroll when mobile menu is open
    if (this.isMobileMenuOpen) {
     // console.log('Disabling body scroll'); // Debug log to verify scroll prevention
      document.body.style.overflow = 'hidden';
    } else {
      // console.log('Enabling body scroll'); // Debug log to verify scroll enabling
      document.body.style.overflow = 'scroll';
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = 'scroll';
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
