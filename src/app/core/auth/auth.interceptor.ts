// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ToastrService } from 'ngx-toastr';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const toastr = inject(ToastrService);
  const router = inject(Router);

  // Skip adding token for auth endpoints
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  const token = authService.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && error.error?.message?.includes('session has been terminated')) {
  authService.logout();
  toastr.warning('You were logged out because you logged in from another device.');
  router.navigate(['/auth/login']);
}
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};
