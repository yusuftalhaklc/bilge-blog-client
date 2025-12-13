import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/common/api-response.model';
import { RefreshTokenRequest } from '../models/auth/refresh-token-request.model';
import { RefreshTokenResponse } from '../models/auth/refresh-token-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private isRefreshing = false;
  private refreshTokenSubject: Observable<RefreshTokenResponse> | null = null;
  
  token = signal<string>('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NTNmM2M2Mi0zNWNkLTQ5NmYtOTg0ZS1iNmI4OGYyNTg0YmIiLCJlbWFpbCI6Inl1c3VmdGFsaGFrbGNAZ21haWwuY29tIiwibmFtZSI6Ill1c3VmIFRhbGhhIEvEsWzEscOnIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWRtaW4iLCJleHAiOjE3NjU2MjI4NzgsImlzcyI6Imh0dHBzOi8vYmlsZ2VibG9nLnl1c3VmdGFsaGFrbGMuY29tIiwiYXVkIjoiaHR0cHM6Ly9iaWxnZWJsb2cueXVzdWZ0YWxoYWtsYy5jb20ifQ.MwybO_O0QCggzN3GvR0xiPcm39BoE7kMGUHLGhx6pRQ');
  refreshToken = signal<string>('RE6VLmtbccl1MdnATN7PPUdB63u3/DqRRSCd0SUird4J4AL/s/UwbtOUHtJ0bgyLH8+e4yVCkmQpFkCsYbd9GQ==');

  constructor(private http: HttpClient) {
    const savedToken = localStorage.getItem(this.TOKEN_KEY);
    const savedRefreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    
    if (savedToken) { 
      this.token.set(savedToken);
    }
    if (savedRefreshToken) {
      this.refreshToken.set(savedRefreshToken);
    }
  }

  getToken(): string {
    return this.token();
  }

  getRefreshToken(): string {
    return this.refreshToken();
  }

  setTokens(token: string, refreshToken: string): void {
    this.token.set(token);
    this.refreshToken.set(refreshToken);
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  refreshTokenRequest(): Observable<RefreshTokenResponse> {
    if (this.isRefreshing && this.refreshTokenSubject) {
      return this.refreshTokenSubject;
    }

    this.isRefreshing = true;
    const request: RefreshTokenRequest = {
      token: this.getToken(),
      refreshToken: this.getRefreshToken()
    };

    this.refreshTokenSubject = this.http.post<ApiResponse<RefreshTokenResponse>>(
      `${environment.apiBaseUrl}/User/refresh-token`,
      request
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          this.setTokens(response.data.token, response.data.refreshToken);
          this.isRefreshing = false;
          this.refreshTokenSubject = null;
          return response.data;
        }
        this.isRefreshing = false;
        this.refreshTokenSubject = null;
        throw new Error('Token refresh failed');
      }),
      shareReplay(1)
    );

    return this.refreshTokenSubject;
  }
}

