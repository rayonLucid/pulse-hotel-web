// src/app/modules/auth/auth.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from '../../../login.component/login.component';
import { RegisterComponent } from '../../../register.component/register.component';
import { ForgotPasswordComponent } from '../../../forgot-password.component/forgot-password.component';
import { ResetPasswordComponent } from '../../reset-password.component/reset-password.component';



export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
   { path: 'reset-password/:token', component: ResetPasswordComponent },


  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
