// src/app/layouts/header/header.component.ts
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { SearchResult, SearchService } from '../../../core/services/search.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;

  searchControl = new FormControl(''); // Use FormControl directly instead of FormGroup
  showUserMenu = false;
  showMobileMenu = false;
  showSearchResults = false;
  searchResults: SearchResult[] = [];
  isSearching = false;
  recentSearches: string[] = [];

  private searchSubscription?: Subscription;
public authService: AuthService = inject(AuthService);
private searchService: SearchService = inject(SearchService);
  constructor(

    public router: Router

  ) {}

  ngOnInit(): void {
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

  // ==================== SEARCH METHODS ====================

  onSearchFocus(): void {
    const query = this.searchControl.value;
    if (query && query.length >= 2) {
      this.showSearchResults = true;
    } else if (this.recentSearches.length > 0) {
      this.showSearchResults = true;
    }
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
