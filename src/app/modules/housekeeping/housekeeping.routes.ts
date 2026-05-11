// src/app/modules/housekeeping/housekeeping.routes.ts
import { Routes } from '@angular/router';
import { HousekeepingComponent } from './housekeeping.component/housekeeping.component';


export const HOUSEKEEPING_ROUTES: Routes = [
  { path: '', component: HousekeepingComponent },
  { path: 'tasks', component: HousekeepingComponent },
  { path: 'rooms', component: HousekeepingComponent },
  { path: 'inspections', component: HousekeepingComponent },
  { path: 'lost-found', component: HousekeepingComponent }
];
