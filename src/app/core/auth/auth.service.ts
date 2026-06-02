// src/app/core/auth/auth.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { JwtHelperService } from '@auth0/angular-jwt';

import { AppConfigService } from '../services/app.config.service';

export interface User {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isStaff:boolean;
  department:string
  loyaltyPoints: number;
  isActive: boolean;
  profileImageUrl?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    userId: number;
    fullName: string;
    email: string;
    token: string;
    departmentId:number;
    isStaff:boolean;
    role: string;
    loyaltyPoints: number;
    tokenExpiry: Date;
  };
  message: string;
}

interface JwtPayload {
  department: string;
  userId: string;
  roleId: string;
  isStaff: string;
  departmentId: string;
  // ... other claims
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey = 'access_token';
  private userKey = 'user_data';
  private jwtHelper = new JwtHelperService();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
    //config=inject(AppConfigService)
  constructor(
    private http: HttpClient,
    private router: Router,
    private configService:AppConfigService,
    private toastr: ToastrService,

  ) {
    console.log(this.configService.apiUrl)
   // this.apiUrl = `${this.configService.apiUrl}`;
    this.loadStoredUser();
  }
  private get apiUrl(): string {
    return this.configService.apiUrl;
  }
  // ==================== AUTHENTICATION METHODS ====================

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data.token) {
          this.setSession(response.data);
          this.toastr.success(`Welcome back, ${response.data.fullName}!`, 'Login Successful');
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  register(registerData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/register`, registerData).pipe(
      tap(response => {
      //  console.log('Registration response:', response);
        if (response.success) {
          this.toastr.success('Registration successful! Please login.', 'Success');
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.toastr.info('You have been logged out.', 'Goodbye!');
    this.router.navigate(['/auth/login']);
  }

  // ==================== TOKEN METHODS ====================

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      return !this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      return false;
    }
  }

  // ==================== USER INFORMATION METHODS ====================

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isFrontDeskStaff(): boolean {
  const user = this.getCurrentUser();
  //console.log(user)
  if (!user) return false;

  return user.isStaff && (user.department?.toLowerCase() === 'front office'|| user.department?.toLowerCase()=='front desk');
  // Or 'front-end' as per your requirement. Adjust the string comparison.
}


  getUserFullName(): string | null {
    const user = this.currentUserSubject.value;
    if (user) return user.fullName;

    // Try to get from token as fallback
    const token = this.getToken();
    if (token) {
      try {
        const decoded = this.jwtHelper.decodeToken(token);
        return decoded['fullName'] || decoded['unique_name'] || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  getUserEmail(): string | null {
    const user = this.currentUserSubject.value;
    if (user) return user.email;

    const token = this.getToken();
    if (token) {
      try {
        const decoded = this.jwtHelper.decodeToken(token);
        return decoded['email'] || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  getUserId(): number | null {
    const user = this.currentUserSubject.value;
    if (user) return user.userId;

    const token = this.getToken();
    if (token) {
      try {
        const decoded = this.jwtHelper.decodeToken(token);
        return decoded['userId'] || decoded['nameid'] || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    if (user) return user.role;

    const token = this.getToken();
    if (token) {
      try {
        const decoded = this.jwtHelper.decodeToken(token);
        return decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
               decoded['role'] ||
               null;
      } catch {
        return null;
      }
    }
    return null;
  }

  getUserDepartment(): string | null {
    const user = this.currentUserSubject.value;
    if (user) return user.department;

    const token = this.getToken();
    if (token) {
      try {
        const decoded = this.jwtHelper.decodeToken(token) as JwtPayload;
        return  decoded.department  ||  decoded.departmentId|| null;
      } catch {
        return null;
      }
    }
    return null;
  }

  getUserLoyaltyPoints(): number {
    const user = this.currentUserSubject.value;
    return user?.loyaltyPoints || 0;
  }

  // ==================== ROLE CHECKING METHODS ====================

  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    if (!userRole) return false;
    return roles.includes(userRole);
  }

  hasAllRoles(roles: string[]): boolean {
    const userRole = this.getUserRole();
    if (!userRole) return false;
    return roles.every(role => role === userRole);
  }

  // Convenience role check methods
  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  isManager(): boolean {
    return this.hasAnyRole(['Admin', 'Manager']);
  }

  isSupervisor(): boolean {
    return this.hasAnyRole(['Admin', 'Manager', 'Supervisor']);
  }

  isStaff(): boolean {
    return this.hasAnyRole(['Admin', 'Manager', 'Supervisor', 'Junior Staff','Senior Staff']);
  }

  isGuest(): boolean {
    return this.hasRole('Guest');
  }

  // ==================== PERMISSION CHECKING ====================

  hasPermission(requiredRoles: string[]): boolean {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return this.hasAnyRole(requiredRoles);
  }

  // ==================== PRIVATE METHODS ====================

  private setSession(authData: any): void {
    const user: User = {
      userId: authData.userId,
      fullName: authData.fullName,
      isStaff :authData.isStaff,
      department:authData.department,
      email: authData.email,
      phoneNumber: authData.phoneNumber,
      role: authData.role,
      loyaltyPoints: authData.loyaltyPoints,
      isActive: true
    };

    sessionStorage.setItem(this.tokenKey, authData.token);
    sessionStorage.setItem(this.userKey, JSON.stringify(user));

    this.currentUserSubject.next(user);
    this.isLoggedInSubject.next(true);
  }

  private loadStoredUser(): void {
    const storedUser = sessionStorage.getItem(this.userKey);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
      } catch (error) {
        console.error('Error loading stored user:', error);
        this.logout();
      }
    }
  }

  private hasToken(): boolean {
    return !!sessionStorage.getItem(this.tokenKey);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again.';
    let errorTitle = 'Error';

    console.error('API Error:', error);

    switch (error.status) {
      case 0:
        errorMessage = error.error?.message|| 'Unable to connect to the server. Please check your internet connection.';
        errorTitle = 'Connection Error';
        break;
      case 400:
        errorMessage = error.error?.message || 'Invalid request. Please check your input.';
        break;
      case 401:
        errorMessage = error.error?.message||'Invalid email or password. Please try again.';
        errorTitle = 'Login Failed';
        break;
      case 403:
        errorMessage = error.error?.message || 'You do not have permission to perform this action.';
        errorTitle = 'Access Denied';
        break;
      case 404:
        errorMessage = error.error?.message || 'The requested resource was not found.';
        errorTitle = 'Not Found';
        break;
      case 409:
        errorMessage = error.error?.message || 'User with this email already exists.';
        errorTitle = 'Registration Failed';
        break;
      case 500:
        errorMessage = error.error?.message || 'Server error. Please try again later.';
        errorTitle = 'Server Error';
        break;
      default:
        errorMessage = error.error?.message || 'An unexpected error occurred.';
        break;
    }

    this.toastr.error(errorMessage, errorTitle);

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      originalError: error
    }));
  }

  // Add this method to your AuthService class

forgotPassword(email: string): Observable<{success:boolean,message:string}> {
 // console.log(this.apiUrl)
  return this.http.post<{success:boolean,message:string}>(`${this.apiUrl}/auth/forgot-password`, { email }).pipe(
    tap(response => {
      console.log(response)
      this.toastr.success('If your email is registered, you will receive password reset instructions.', 'Check Your Email');
    }),
    catchError((error) => this.handleError(error))
  );
}

resetPassword(email: string, token: string, newPassword: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/auth/reset-password`, { email, token, newPassword }).pipe(
    catchError(this.handleError.bind(this))
  );
}
}
