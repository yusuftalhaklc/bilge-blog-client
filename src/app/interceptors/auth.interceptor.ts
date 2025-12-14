import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStateService } from '../services/auth-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthStateService);
  const token = authState.currentToken();

  // Skip adding token for login/register/refresh-token endpoints
  if (req.url.includes('/User/login') || 
      req.url.includes('/User/register') || 
      req.url.includes('/User/refresh-token')) {
    return next(req);
  }

  // Add token to request if available
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};

