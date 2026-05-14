import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App  implements OnInit{
   wasHidden = false;
   private authService:AuthService =inject(AuthService)

   constructor( private toaStr :ToastrService){

   }
  ngOnInit(): void {

//this.setupBeforeUnload()
  }
count=0
private setupBeforeUnload(): void {

    localStorage.setItem('active_tabs',this.count.toLocaleString())
      // Clean up when tab is closed

      const tabs = this.getActiveTabCount();
       this.toaStr.warning('Tab Count '+tabs.toLocaleString())
      if (tabs <= 0) {
         this.count++;
        // Last tab, clear session
      //  localStorage.removeItem('active_tabs')

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
  protected readonly title = signal('pulse-hotel-web');
}
