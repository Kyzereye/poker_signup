import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

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
    return this.httpClient.get<AdminDashboardData>(`${this.url}/admin_routes/dashboard_data`);
  }

  // Get user statistics
  getUserStats(): Observable<UserStats> {
    return this.httpClient.get<UserStats>(`${this.url}/admin_routes/user_stats`);
  }

  // Get all users with pagination
  getAllUsers(page: number = 1, limit: number = 10): Observable<{users: User[], total: number, page: number, totalPages: number}> {
    return this.httpClient.get<{users: User[], total: number, page: number, totalPages: number}>(`${this.url}/admin_routes/users?page=${page}&limit=${limit}`);
  }

  // Get user by ID
  getUserById(userId: number): Observable<User> {
    return this.httpClient.get<User>(`${this.url}/admin_routes/users/${userId}`);
  }

  // Update user role
  updateUserRole(userId: number, role: 'player' | 'dealer' | 'admin'): Observable<any> {
    return this.httpClient.put(`${this.url}/admin_routes/users/${userId}/role`, { role });
  }

  // Update user information
  updateUser(userId: number, userData: Partial<User>): Observable<any> {
    return this.httpClient.put(`${this.url}/admin_routes/users/${userId}`, userData);
  }

  // Delete user (soft delete)
  deleteUser(userId: number): Observable<any> {
    return this.httpClient.delete(`${this.url}/admin_routes/users/${userId}`);
  }

  // Get system information
  getSystemInfo(): Observable<any> {
    return this.httpClient.get(`${this.url}/admin_routes/system_info`);
  }

  // Refresh all data
  refreshData(): Observable<AdminDashboardData> {
    return this.httpClient.post<AdminDashboardData>(`${this.url}/admin_routes/refresh_data`, {});
  }
}
