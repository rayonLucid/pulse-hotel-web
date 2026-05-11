// src/app/modules/staff/staff.routes.ts
import { Routes } from '@angular/router';
import { StaffComponent } from './staff.component/staff.component';


export const STAFF_ROUTES: Routes = [
  { path: '', component: StaffComponent },
  { path: 'list', component: StaffComponent },
  { path: 'schedules', component: StaffComponent },
  { path: 'attendance', component: StaffComponent },
  { path: 'leaves', component: StaffComponent }
];
