// src/app/core/auth/single-tab.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class SingleTabGuard implements CanActivate {
  private readonly TAB_ID = 'tab_id';
  private tabId: string;

   private readonly SESSION_KEY = 'session_id';
  private readonly TAB_ID_KEY = 'tab_id';
  private sessionId: string='';

count =0

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.tabId = this.generateTabId();
//this.setupBeforeUnload()
  }

  canActivate(): boolean {
    const existingTabId = localStorage.getItem(this.TAB_ID);

// console.log(existingTabId)
//     if (existingTabId && existingTabId !== this.tabId && this.authService.isAuthenticated()) {
//     //  this.toastr.warning('You have been logged out because you opened the app in another tab', 'Multiple Tabs Detected');
    //   this.authService.logout();
   //   this.router.navigate(['/auth/login']);
//       return false;
//     }
 this.setupStorageListener();
    localStorage.setItem(this.TAB_ID, this.tabId);
    return true;
  }

  // private setupStorageListener(): void {
  //   window.addEventListener('storage', (event) => {
  //     if (event.key === this.TAB_ID && event.newValue !== this.tabId && this.authService.isAuthenticated()) {
  //       this.authService.logout();
  //    //   this.toastr.warning('You have been logged out because you opened the app in another tab', 'Multiple Tabs Detected');
  //       this.router.navigate(['/auth/login']);
  //     }
  //   });
  // }

    private setupStorageListener(): void {

//this.setupBeforeUnload()
  }

  private setupBeforeUnload(): void {
  this.count++
    localStorage.setItem('active_tabs',this.count.toLocaleString())
      // Clean up when tab is closed

      const tabs = this.getActiveTabCount();
     //  this.toastr.warning('Tab Count '+tabs.toLocaleString())
      if (tabs <= 1) {
        // Last tab, clear session
        localStorage.removeItem('active_tabs')

      }else{
         localStorage.removeItem('active_tabs')
 this.authService.logout();
  //this.router.navigate(['/auth/login']);
      }

  }

  private getActiveTabCount(): number {
    // This is a simple approach; for production, you might want a more robust solution
    const tabs = localStorage.getItem('active_tabs');
    return tabs ? parseInt(tabs) : 0;
  }

  private logoutDueToMultipleTabs(): void {
    this.performLogout('You have been logged out because you opened the app in another tab. Only one session is allowed.');
  }

  private logoutDueToSessionChange(): void {
    this.performLogout('Your session has expired due to activity in another tab.');
  }

  private performLogout(message: string): void {
    if (this.authService.isAuthenticated()) {
      this.authService.logout();
      this.toastr.warning(message, 'Session Ended');
      this.router.navigate(['/auth/login']);
    }
  }
  private generateTabId(): string {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }


  private setSession(): void {
    localStorage.setItem(this.SESSION_KEY, this.sessionId);
    localStorage.setItem(this.TAB_ID_KEY, this.tabId);
    localStorage.setItem('last_activity', Date.now().toString());
  }

  private clearSession(): void {
     localStorage.removeItem('active_tabs')

  }
}
