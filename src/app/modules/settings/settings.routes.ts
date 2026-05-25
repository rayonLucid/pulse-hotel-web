// src/app/modules/settings/settings.routes.ts
import { Routes } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';
import { SecurityComponent } from './pages/security/security.component';
import { MenuManagerComponent } from './pages/menu/menu-manager.component';

import { RoleManagementComponent } from './pages/role-management.component/role-management.component';
import { NotificationsComponent } from '../notifications/notifications.component';
import { DepartmentListComponent } from './pages/department-list/department-list.component';
import { AmenityListComponent } from '../rooms/pages/amenity-list/amenity-list.component';
import { RoomWizardComponent } from '../rooms/pages/room-wizard/room-wizard.component';



export const SETTINGS_ROUTES: Routes = [
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'profile', component: ProfileComponent },
  { path: 'security', component: SecurityComponent },
   { path: 'rooms', component: RoomWizardComponent },
   { path: 'roles', component: RoleManagementComponent },
   { path: 'notification', component: NotificationsComponent },
   { path: 'amenities', component: AmenityListComponent },
   { path: 'department', component: DepartmentListComponent },
   { path: 'menus', component: MenuManagerComponent },
  { path: '**', redirectTo: 'profile' }
];
