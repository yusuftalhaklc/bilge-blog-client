import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthStateService } from '../services/auth-state.service';
import { AuthService } from '../services/auth.service';

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthStateService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip refresh logic for auth endpoints
  if (req.url.includes('/User/login') || 
      req.url.includes('/User/register') || 
      req.url.includes('/User/refresh-token')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 errors
      if (error.status === 401) {
        const token = authState.currentToken();
        const refreshToken = authState.currentRefreshToken();

        // If we have tokens, try to refresh
        if (token && refreshToken) {
          return authService.refreshToken({ token, refreshToken }).pipe(
            switchMap((response) => {
              // Update tokens
              authState.updateTokens(response.token, response.refreshToken);
              
              // Retry the original request with new token
              const clonedReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.token}`
                }
              });
              return next(clonedReq);
            }),
            catchError((refreshError) => {
              // Refresh failed, clear auth and redirect to login
              authState.clearAuthData();
              router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        } else {
          // No tokens, redirect to login
          authState.clearAuthData();
          router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    })
  );
};

