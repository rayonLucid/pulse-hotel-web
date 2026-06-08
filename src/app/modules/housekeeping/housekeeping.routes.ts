// src/app/modules/housekeeping/housekeeping.routes.ts
import { Routes } from '@angular/router';
import { HousekeepingComponent } from './housekeeping.component/housekeeping.component';
import { HouseKeepingDashboardComponent } from './pages/dashboard/dashboard.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { RoomStatusComponent } from './pages/room-status/room-status.component';
import { InspectionsComponent } from './pages/inspections/inspections.component';
import { LostFoundComponent } from './pages/lost-found/lost-found.component';


export const HOUSEKEEPING_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: HouseKeepingDashboardComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'rooms', component: RoomStatusComponent },
  { path: 'inspections', component: InspectionsComponent },
  { path: 'lost-found', component: LostFoundComponent },
  { path: '**', redirectTo: 'dashboard' }
];
