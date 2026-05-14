// src/app/modules/staff/staff.routes.ts
import { Routes } from '@angular/router';
import { PerformanceComponent } from './pages/performance/performance';
import { StaffListComponent } from './pages/staff-list/staff-list.component';
import { StaffDetailComponent } from './pages/staff-detail/staff.component';
import { ShiftScheduleComponent } from './pages/shift-schedule/shift-schedule';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { LeaveRequestsComponent } from './pages/leave-requests/leave-requests.component';



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
  { path: '**', redirectTo: 'list' }
];
