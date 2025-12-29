import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserService } from './user.service';
import { RoleService } from './role.service';
import { TokenService } from './token.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticated = new BehaviorSubject<boolean>(false);
  private currentUser = new BehaviorSubject<any>(null);

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private tokenService: TokenService,
    private router: Router
  ) {
    // Initialize auth state on service creation
    this.initializeAuth();
  }

  isAuthenticated(): boolean {
    // Check if token exists
    return this.tokenService.hasAccessToken() && this.authenticated.value;
  }

  getCurrentUser() {
    return this.currentUser.asObservable();
  }

  login(userData: any, accessToken?: string, refreshToken?: string): void {
    // Store tokens if provided
    if (accessToken && refreshToken) {
      this.tokenService.setTokens(accessToken, refreshToken);
    }
    
    this.authenticated.next(true);
    this.currentUser.next(userData);
    
    // Set user role
    if (userData.role) {
      this.roleService.setCurrentUserRole(userData.role);
    }
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.authenticated.next(false);
    this.currentUser.next(null);
    this.roleService.clearRole();
    this.router.navigate(['/login']);
  }

  /**
   * Initialize authentication state from stored tokens
   */
  initializeAuth(): void {
    if (this.tokenService.hasAccessToken()) {
      // Token exists, but we need to verify it's valid by checking if user data is available
      // For now, we'll set authenticated to true if token exists
      // The token will be validated when making API calls
      this.authenticated.next(true);
    }
  }
}
