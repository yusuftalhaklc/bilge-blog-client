import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 Unauthorized - Token süresi dolmuş
      if (error.status === 401 && !req.url.includes('/User/refresh-token')) {
        return authService.refreshTokenRequest().pipe(
          switchMap(() => {
            // Yeni token ile orijinal isteği tekrar dene
            const clonedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${authService.getToken()}`
              }
            });

            return next(clonedRequest);
          }),
          catchError((refreshError) => {
            return throwError(() => refreshError);
          })
        );
      }


      return throwError(() => error);
    })
  );
};
