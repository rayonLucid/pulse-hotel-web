// src/app/modules/staff/staff.routes.ts
import { Routes } from '@angular/router';
import { PerformanceComponent } from './pages/performance/performance';
import { StaffListComponent } from './pages/staff-list/staff-list.component';
import { StaffDetailComponent } from './pages/staff-detail/staff.component';
import { ShiftScheduleComponent } from './pages/shift-schedule/shift-schedule';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { LeaveRequestsComponent } from './pages/leave-requests/leave-requests.component';
import { PendingLeaveRequestsComponent } from './pages/pending-leave-requests/pending-leave-requests.component';
import { MyLeaveRequestsComponent } from './pages/my-leave-requests/my-leave-requests.component';
import { RoleGuard } from '../../core/auth/role.guard-guard';



export const STAFF_ROUTES: Routes = [
   { path: '', redirectTo: 'list', pathMatch: 'full' },
   { path: 'list', component: StaffListComponent },
   { path: 'add', component: StaffDetailComponent },
   { path: 'detail/:id', component: StaffDetailComponent },
    { path: 'detail/:id/:action', component: StaffDetailComponent },

   { path: 'schedules', component: ShiftScheduleComponent },
   { path: 'attendance', component: AttendanceComponent },
   { path: 'leaves', component: LeaveRequestsComponent },
   { path: 'performance', component: PerformanceComponent },
    { path: 'leave/my-requests', component: MyLeaveRequestsComponent },
    { path: 'leave/pending', component: PendingLeaveRequestsComponent, canActivate: [RoleGuard], data: { roles: ['Admin','Manager','Supervisor','Senior Staff'] } },
  { path: '**', redirectTo: 'list' }
];
