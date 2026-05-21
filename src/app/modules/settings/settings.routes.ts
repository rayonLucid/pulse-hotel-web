// src/app/modules/settings/settings.routes.ts
import { Routes } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';
import { SecurityComponent } from './pages/security/security.component';
import { MenuManagerComponent } from './pages/menu/menu-manager.component';


export const SETTINGS_ROUTES: Routes = [
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'profile', component: ProfileComponent },
  { path: 'security', component: SecurityComponent },
  // { path: 'hotel', component: HotelSettingsComponent },
  // { path: 'users', component: UserSettingsComponent },
  // { path: 'notifications', component: NotificationsComponent },
  // { path: 'billing', component: BillingSettingsComponent },
  // { path: 'integrations', component: IntegrationsComponent },
   { path: 'menus', component: MenuManagerComponent },
  { path: '**', redirectTo: 'profile' }
];
