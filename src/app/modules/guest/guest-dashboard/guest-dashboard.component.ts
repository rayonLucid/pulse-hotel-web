import { Component, inject } from '@angular/core';
import { GuestService } from '../../../core/services/guest.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-guest-dashboard.component',
  imports: [CommonModule,FormsModule],
  templateUrl: './guest-dashboard.component.html',
  styleUrl: './guest-dashboard.component.scss',
})
export class GuestDashboardComponent {
  private guestService = inject(GuestService);
  dashboard: any = { upcomingBookings: [], pastBookings: [], profile: {} };
  loading = true;

  ngOnInit() {
    this.guestService.getDashboard().subscribe({
      next: (res) => {
        this.dashboard = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getGuestName() {
    const user = this.guestService.getGuestUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  }
}
