import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type UserRole = 'player' | 'dealer' | 'admin';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private currentUserRole = new BehaviorSubject<UserRole>('player');
  private isAdmin = new BehaviorSubject<boolean>(false);
  private isDealer = new BehaviorSubject<boolean>(false);
  private isPlayer = new BehaviorSubject<boolean>(false);

  constructor() { }

  // Get current user role as Observable
  getCurrentUserRole(): Observable<UserRole> {
    return this.currentUserRole.asObservable();
  }

  // Set current user role
  setCurrentUserRole(role: UserRole): void {
    this.currentUserRole.next(role);
    
    // Update role flags
    this.isAdmin.next(role === 'admin');
    this.isDealer.next(role === 'dealer');
    this.isPlayer.next(role === 'player');
  }

  // Check if current user has admin role
  hasAdminRole(): Observable<boolean> {
    return this.isAdmin.asObservable();
  }

  // Check if current user has dealer role
  hasDealerRole(): Observable<boolean> {
    return this.isDealer.asObservable();
  }

  // Check if current user has player role
  hasPlayerRole(): Observable<boolean> {
    return this.isPlayer.asObservable();
  }

  // Check if user has specific role (synchronous)
  hasRole(roleName: UserRole): boolean {
    return this.currentUserRole.value === roleName;
  }

  // Check if user is admin (synchronous)
  isUserAdmin(): boolean {
    return this.currentUserRole.value === 'admin';
  }

  // Check if user is dealer (synchronous)
  isUserDealer(): boolean {
    return this.currentUserRole.value === 'dealer';
  }

  // Check if user is player (synchronous)
  isUserPlayer(): boolean {
    return this.currentUserRole.value === 'player';
  }

  // Clear role (for logout)
  clearRole(): void {
    this.currentUserRole.next('player');
    this.isAdmin.next(false);
    this.isDealer.next(false);
    this.isPlayer.next(false);
  }
}
