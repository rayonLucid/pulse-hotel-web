// src/app/layouts/header/header.component.ts
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { SearchResult, SearchService } from '../../../core/services/search.service';
import { Breadcrumb } from '../../../core/models/auth.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;
   @Input() isMobile: boolean = false;
  @Output() menuToggle = new EventEmitter<void>();

  searchControl = new FormControl(''); // Use FormControl directly instead of FormGroup
  showUserMenu = false;
  showMobileMenu = false;
  showSearchResults = false;
  searchResults: SearchResult[] = [];
  isSearching = false;
  recentSearches: string[] = [];

 breadcrumbs: Breadcrumb[] = [];


  private searchSubscription?: Subscription;
public authService: AuthService = inject(AuthService);
private searchService: SearchService = inject(SearchService);
  constructor(

    public router: Router

  ) {}

  ngOnInit(): void {
      this.setupBreadcrumbs();
    // Load recent searches from localStorage
    this.loadRecentSearches();

    // Setup search with debounce
    this.searchSubscription = this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          if (query && query.length >= 2) {
            this.isSearching = true;
            this.showSearchResults = true;
            return this.searchService.globalSearch(query);
          } else {
            this.showSearchResults = false;
            this.searchResults = [];
            return of([]);
          }
        }),
        catchError(() => {
          this.isSearching = false;
          return of([]);
        })
      )
      .subscribe(results => {
        this.searchResults = results;
        this.isSearching = false;
      });

    // Add keyboard shortcut (Ctrl+K)
    document.addEventListener('keydown', this.handleKeyboardShortcut.bind(this));
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    document.removeEventListener('keydown', this.handleKeyboardShortcut.bind(this));
  }

   private setupBreadcrumbs(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.breadcrumbs = this.buildBreadcrumbs(this.router.url);
        // console.log('Updated breadcrumbs:', this.breadcrumbs); // Debug log to verify breadcrumb updates
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
//console.log('Built breadcrumbs:', breadcrumbs); // Debug log to verify breadcrumb construction
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


  // ==================== SEARCH METHODS ====================

  onSearchFocus(): void {
    const query = this.searchControl.value;
    if (query && query.length >= 2) {
      this.showSearchResults = true;
    } else if (this.recentSearches.length > 0) {
      this.showSearchResults = true;
    }
  }

toggleSidebar(): void {
    this.menuToggle.emit();
  }



  onSearchBlur(): void {
    // Delay to allow click on result
    setTimeout(() => {
      this.showSearchResults = false;
    }, 200);
  }

  onSearchResultClick(result: SearchResult): void {
    // Save to recent searches
    this.saveToRecentSearches(this.searchControl.value || '');

    // Navigate to the result
    this.router.navigate([result.routerLink]);

    // Clear search and close results
    this.searchControl.setValue('');
    this.showSearchResults = false;
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.showSearchResults = false;
    this.searchInput.nativeElement.focus();
  }

  clearRecentSearches(): void {
    this.recentSearches = [];
    localStorage.removeItem('recent_searches');
    this.showSearchResults = false;
  }

  /**
   * Get color for search result icon
   */
  getResultColor(color: string): string {
    const colors: { [key: string]: string } = {
      'blue': '#3b82f6',
      'green': '#10b981',
      'red': '#ef4444',
      'yellow': '#f59e0b',
      'purple': '#8b5cf6',
      'pink': '#ec4899',
      'indigo': '#6366f1',
      'teal': '#14b8a6',
      'orange': '#f97316',
      'gray': '#6b7280'
    };
    return colors[color] || colors['gray'];
  }

  private handleKeyboardShortcut(event: KeyboardEvent): void {
    // Ctrl+K or Cmd+K to focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput.nativeElement.focus();
    }

    // Escape to clear search
    if (event.key === 'Escape' && this.searchControl.value) {
      this.clearSearch();
    }
  }

  private loadRecentSearches(): void {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      try {
        this.recentSearches = JSON.parse(saved);
      } catch (e) {
        this.recentSearches = [];
      }
    }
  }

  private saveToRecentSearches(query: string): void {
    if (!query || query.trim().length === 0) return;

    // Remove if exists and add to front
    this.recentSearches = this.recentSearches.filter(q => q !== query);
    this.recentSearches.unshift(query);

    // Keep only last 5
    this.recentSearches = this.recentSearches.slice(0, 5);

    // Save to localStorage
    localStorage.setItem('recent_searches', JSON.stringify(this.recentSearches));
  }

  // ==================== UI METHODS ====================

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    document.body.classList.toggle('mobile-menu-open', this.showMobileMenu);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getUserInitials(): string {
    const fullName = this.authService.getUserFullName() || 'Guest';
    return fullName.split(' ').map((n:any) => n[0]).join('').toUpperCase();
  }
}
