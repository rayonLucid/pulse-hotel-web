// src/app/modules/rooms/rooms.routes.ts
import { Routes } from '@angular/router';
import { RoomsListComponent } from './pages/rooms-list/rooms-list.component';
import { RoomDetailComponent } from './pages/room-detail/room-detail.component';
import { RoomStatusComponent } from './pages/room-status/room-status.component';
import { RoomTypesComponent } from './pages/room-types/room-types.component';


export const ROOMS_ROUTES: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: RoomsListComponent },
  { path: 'detail/:id', component: RoomDetailComponent },
  { path: 'status', component: RoomStatusComponent },
  { path: 'types', component: RoomTypesComponent },
  { path: '**', redirectTo: 'list' }
];
