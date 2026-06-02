// frontdesk-dashboard.component.ts
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardData } from '../../../core/models/dashboard.model';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { ClockInRequest, ClockOutRequest, StaffCurrentStatusDto } from '../../../core/models/staff.model';
import { StaffService } from '../../../core/services/staff.service';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/auth.models';
import { interval, Subscription } from 'rxjs';


@Component({
  selector: 'app-frontdesk-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './frontdesk-dashboard.component.html',
  styleUrl: `./frontdesk-dashboard.component.scss`
})
export class FrontDeskDashboardComponent implements OnInit,OnDestroy {
  private dashboardService = inject(DashboardService);
  staffService = inject(StaffService)
  status!:StaffCurrentStatusDto
  toastService= inject(ToastrService)
  userInfo!:User
  currentUserInfo =inject(AuthService)
  dashboard: DashboardData | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];
isLoading =false;
cdr =inject(ChangeDetectorRef)
  countdown: string = '';
  private countdownSubscription?: Subscription;

   showShiftEndWarning = false;
  isOvertime = false;
  overtimeMinutes = 0;

  ngOnInit() {
  this.userInfo =  this.currentUserInfo.getCurrentUser()!
     this.loadDashboard();
this.startCountdown();
   }

    ngOnDestroy() {
    this.stopCountdown();
  }


 private startCountdown() {
    this.stopCountdown();
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.updateCountdown();
      this.cdr.markForCheck()
    });
  }

  private stopCountdown() {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = undefined;
    }
  }

  private resetCountdown() {
    this.updateCountdown();
  }

  // private updateCountdown() {
  //   if (!this.status.isOnDuty || !this.status.hasShiftAssignment || !this.status.shiftEndTime) {
  //     this.countdown = '';
  //     return;
  //   }

  //   const now = new Date();
  //   const [hours, minutes, seconds] = this.status.shiftEndTime.split(':').map(Number);
  //   const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);

  //   let diffMs = endTime.getTime() - now.getTime();
  //   if (diffMs <= 0) {
  //     this.countdown = 'Shift ended';
  //     return;
  //   }

  //   const diffSeconds = Math.floor(diffMs / 1000);
  //   const hrs = Math.floor(diffSeconds / 3600);
  //   const mins = Math.floor((diffSeconds % 3600) / 60);
  //   const secs = diffSeconds % 60;

  //   this.countdown = `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
  // }


   private updateCountdown() {
    if (!this.status.isOnDuty || !this.status.hasShiftAssignment || !this.status.shiftEndTime) {
      this.countdown = '';
      this.showShiftEndWarning = false;
      return;
    }

    const now = new Date();
    const [hours, minutes] = this.status.shiftEndTime.split(':').map(Number);
    const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);

    let diffMs = endTime.getTime() - now.getTime();

    if (diffMs <= 0) {
      this.countdown = 'Shift ended';
      this.showShiftEndWarning = true;
      return;
    }

    this.showShiftEndWarning = false;
    const diffSeconds = Math.floor(diffMs / 1000);
    const hrs = Math.floor(diffSeconds / 3600);
    const mins = Math.floor((diffSeconds % 3600) / 60);
    const secs = diffSeconds % 60;
    this.countdown = `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
  }




  loadDashboard() {
     this.dashboardService.getFrontDeskDashboard(new Date(this.selectedDate))
    .subscribe({
      next:(res) =>
     {  this.dashboard = res.data}
      ,complete:() =>{
          this.LoadStaffStatus()
      },
      error:(err)=>{
           this.toastService.error(err,"Error")
    }
    }
      );
      }
  LoadStaffStatus() {
    this.staffService.getCurrentStatus().subscribe(
      (response)=>{
        this.status =response
        console.log(this.status)
        this.cdr.detectChanges()
      }
      ,(error)=>{
        console.log(error)
          this.toastService.error(error,"Error")

      }
    )
  }

   clockIn() {
    this.isLoading = true;
      const request: ClockInRequest = {
      shiftId: this.status.shiftId,       // backend will auto-assign from shift assignment
      clockInMethod: 'Manual',
      notes: ''
    };
    console.log(request)
    if(request.shiftId==undefined){
         this.toastService.error("You have not been assigned to work at this time","Error",{timeOut:5000});
         return
    }
    this.staffService.clockIn(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.LoadStaffStatus(); // refresh status after clock‑in
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
           this.toastService.error(err.error.message || 'Clock‑in failed');
      }
    });
  }

  clockOut() {
    this.isLoading = true;
     const request: ClockOutRequest = {
      clockOutMethod: 'Manual',
      notes: ''

    }
    this.staffService.clockOut(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.LoadStaffStatus(); // refresh status after clock‑out
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        alert('Clock‑out failed');
      }
    });
  }
}
