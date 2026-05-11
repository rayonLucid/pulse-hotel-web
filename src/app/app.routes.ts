// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component/main-layout.component';


export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  // Auth routes (no layout)
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Protected routes with main layout
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./modules/dashboards/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      },
      {
        path: 'staff',
        loadChildren: () => import('./modules/staffs/staff.routes').then(m => m.STAFF_ROUTES),
        data: { roles: ['Admin', 'Manager'] }
      },
      {
        path: 'housekeeping',
        loadChildren: () => import('./modules/housekeeping/housekeeping.routes').then(m => m.HOUSEKEEPING_ROUTES)
      },
      {
        path: 'inventory',
        loadChildren: () => import('./modules/inventory/inventory.routes').then(m => m.INVENTORY_ROUTES),
        data: { roles: ['Admin', 'Manager', 'Storekeeper'] }
      },
       {
        path: 'bookings',
        loadChildren: () => import('./modules/bookings/bookings.routes').then(m => m.BOOKINGS_ROUTES)
      },
       {
        path: 'rooms',
        loadChildren: () => import('./modules/rooms/rooms.routes').then(m => m.ROOMS_ROUTES)
      },
      // {
      //   path: 'settings',
      //   loadChildren: () => import('./modules/settings/settings.routes').then(m => m.SETTINGS_ROUTES)
      // }
    ]
  },

  // Unauthorized page
  {
    path: 'unauthorized',
    loadComponent: () => import('../unauthorized.component/unauthorized.component').then(m => m.UnauthorizedComponent)
  },

  // Fallback route
  { path: '**', redirectTo: '/dashboard' }
];
