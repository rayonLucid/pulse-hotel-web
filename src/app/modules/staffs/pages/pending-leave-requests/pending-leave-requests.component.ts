import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveService } from '../../../../core/services/leave.service';


@Component({
  selector: 'app-pending-leave-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-leave-requests.component.html',
  styleUrls: ['./pending-leave-requests.component.scss']
})
export class PendingLeaveRequestsComponent implements OnInit {
  private leaveService = inject(LeaveService);
  pendingRequests: any[] = [];
  loading = false;

  ngOnInit() { this.loadPending(); }

  loadPending() {
    this.loading = true;
    this.leaveService.getPendingRequests().subscribe({
      next: (data) => { this.pendingRequests = data; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  approve(id: number, status: string) {
    this.leaveService.approveLeave(id, status).subscribe(() => this.loadPending());
  }
}
