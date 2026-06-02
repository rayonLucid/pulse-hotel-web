import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { LeaveRequestModalComponent } from '../leave-request-modal/leave-request-modal.component';
import { LeaveService } from '../../../../core/services/leave.service';


@Component({
  selector: 'app-my-leave-requests',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, LeaveRequestModalComponent],
  templateUrl: './my-leave-requests.component.html',
  styleUrls: ['./my-leave-requests.component.scss']
})
export class MyLeaveRequestsComponent implements OnInit {
  private leaveService = inject(LeaveService);
  requests: any[] = [];
  loading = false;
  showRequestModal = false;

  // Pagination properties
  currentPage = 1;
  pageSize = 5;
  totalItems = 0;

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    this.leaveService.getMyRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.totalItems = data.length;
        this.loading = false;
      },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  openRequestModal() {
    this.showRequestModal = true;
  }

  onModalClose(refresh: boolean) {
    this.showRequestModal = false;
    if (refresh) {
      this.loadRequests();
    }
  }

  pageChanged(page: number) {
    this.currentPage = page;
  }
}
