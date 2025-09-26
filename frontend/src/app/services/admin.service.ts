import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface UserStats {
  totalUsers: number;
  adminUsers: number;
  dealerUsers: number;
  playerUsers: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'player' | 'dealer' | 'admin';
  created_at: string;
  last_login?: string;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  user_count: number;
}

export interface AdminDashboardData {
  userStats: UserStats;
  recentUsers: User[];
  systemInfo: {
    databaseStatus: string;
    lastBackup?: string;
    totalGames: number;
    activeSignups: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  // Get admin dashboard data
  getDashboardData(): Observable<AdminDashboardData> {
    return this.httpClient.get<AdminDashboardData>(`${this.url}/api/admin/dashboard_data`);
  }

  // Get user statistics
  getUserStats(): Observable<UserStats> {
    return this.httpClient.get<UserStats>(`${this.url}/api/admin/user_stats`);
  }

  // Get all users with pagination
  getAllUsers(page: number = 1, limit: number = 10): Observable<{users: User[], total: number, page: number, totalPages: number}> {
    return this.httpClient.get<{users: User[], total: number, page: number, totalPages: number}>(`${this.url}/api/admin/users?page=${page}&limit=${limit}`);
  }

  // Get user by ID
  getUserById(userId: number): Observable<User> {
    return this.httpClient.get<User>(`${this.url}/api/admin/users/${userId}`);
  }

  // Update user role
  updateUserRole(userId: number, role: 'player' | 'dealer' | 'admin'): Observable<any> {
    return this.httpClient.put(`${this.url}/api/admin/users/${userId}/role`, { role });
  }

  // Update user information
  updateUser(userId: number, userData: Partial<User>): Observable<any> {
    return this.httpClient.put(`${this.url}/api/admin/users/${userId}`, userData);
  }

  // Delete user (soft delete)
  deleteUser(userId: number): Observable<any> {
    return this.httpClient.delete(`${this.url}/api/admin/users/${userId}`);
  }

  // Get system information
  getSystemInfo(): Observable<any> {
    return this.httpClient.get(`${this.url}/api/admin/system_info`);
  }

  // Refresh all data
  refreshData(): Observable<AdminDashboardData> {
    return this.httpClient.post<AdminDashboardData>(`${this.url}/api/admin/refresh_data`, {});
  }

  // ==================== ROLE MANAGEMENT METHODS ====================

  // Get all roles
  getAllRoles(): Observable<Role[]> {
    return this.httpClient.get<Role[]>(`${this.url}/api/admin/roles`);
  }

  // Get role by ID
  getRoleById(roleId: number): Observable<Role> {
    return this.httpClient.get<Role>(`${this.url}/api/admin/roles/${roleId}`);
  }

  // Create new role
  createRole(roleData: { name: string; description?: string }): Observable<any> {
    return this.httpClient.post(`${this.url}/api/admin/roles`, roleData);
  }

  // Update role
  updateRole(roleId: number, roleData: { name: string; description?: string }): Observable<any> {
    return this.httpClient.put(`${this.url}/api/admin/roles/${roleId}`, roleData);
  }

  // Delete role
  deleteRole(roleId: number): Observable<any> {
    return this.httpClient.delete(`${this.url}/api/admin/roles/${roleId}`);
  }
}
