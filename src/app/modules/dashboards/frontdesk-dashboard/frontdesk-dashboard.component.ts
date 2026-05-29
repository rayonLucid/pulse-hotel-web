// frontdesk-dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardData } from '../../../core/models/dashboard.model';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-frontdesk-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './frontdesk-dashboard.component.html',
  styleUrl: `./frontdesk-dashboard.component.scss`
})
export class FrontDeskDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  toastService= inject(ToastrService)
  dashboard: DashboardData | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];

  ngOnInit() { this.loadDashboard(); }
  loadDashboard() {
     this.dashboardService.getFrontDeskDashboard(new Date(this.selectedDate))
    .subscribe({
      next:(res) =>
     {  this.dashboard = res.data}
      ,error:(err)=>{
           this.toastService.error(err,"Error")
    }
    }
      );
      }
}
