import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../models/common/api-response.model';
import { LoginRequest } from '../models/auth/login-request.model';
import { LoginResponse } from '../models/auth/login-response.model';
import { RegisterRequest } from '../models/auth/register-request.model';
import { RefreshTokenRequest } from '../models/auth/refresh-token-request.model';
import { RefreshTokenResponse } from '../models/auth/refresh-token-response.model';
import { ChangePasswordRequest } from '../models/auth/change-password-request.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/User`;

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        map(response => response.data)
      );
  }

  register(registerRequest: RegisterRequest): Observable<string> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/register`, registerRequest)
      .pipe(
        map(response => response.data)
      );
  }

  refreshToken(refreshTokenRequest: RefreshTokenRequest): Observable<RefreshTokenResponse> {
    return this.http.post<ApiResponse<RefreshTokenResponse>>(`${this.apiUrl}/refresh-token`, refreshTokenRequest)
      .pipe(
        map(response => response.data)
      );
  }

  changePassword(changePasswordRequest: ChangePasswordRequest): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/change-password`, changePasswordRequest)
      .pipe(
        map(response => response.data)
      );
  }
}

