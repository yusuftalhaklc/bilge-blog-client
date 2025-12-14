import { Injectable, signal, computed } from '@angular/core';
import { LoginResponse } from '../models/auth/login-response.model';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly token = signal<string | null>(this.getTokenFromStorage());
  private readonly refreshToken = signal<string | null>(this.getRefreshTokenFromStorage());
  private readonly user = signal<LoginResponse['user'] | null>(this.getUserFromStorage());

  // Computed signals
  readonly isAuthenticated = computed(() => this.token() !== null && this.user() !== null);
  readonly currentUser = computed(() => this.user());
  readonly currentToken = computed(() => this.token());
  readonly currentRefreshToken = computed(() => this.refreshToken());

  // Get full name
  readonly fullName = computed(() => {
    const user = this.user();
    return user ? `${user.firstName} ${user.lastName}` : null;
  });

  setAuthData(loginResponse: LoginResponse): void {
    this.token.set(loginResponse.token);
    this.refreshToken.set(loginResponse.refreshToken);
    this.user.set(loginResponse.user);

    // Save to localStorage
    localStorage.setItem(TOKEN_KEY, loginResponse.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, loginResponse.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(loginResponse.user));
  }

  updateTokens(token: string, refreshToken: string): void {
    this.token.set(token);
    this.refreshToken.set(refreshToken);

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  clearAuthData(): void {
    this.token.set(null);
    this.refreshToken.set(null);
    this.user.set(null);

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private getTokenFromStorage(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  private getRefreshTokenFromStorage(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private getUserFromStorage(): LoginResponse['user'] | null {
    if (typeof window === 'undefined') {
      return null;
    }
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) {
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}

