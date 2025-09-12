import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url = environment.apiUrl;
  user_data = new BehaviorSubject<any>(null);
  location_data = new BehaviorSubject<any>(null);

  constructor(private httpClient: HttpClient) { }

  getCurrentUser() {
    return this.user_data.asObservable();
  }

  setCurrentUser(data: any) {
    this.user_data.next(data)
  }

  getLocation() {
    return this.location_data
  }
  setLocations(data: any) {
    this.location_data.next(data)
  }

  getUserData(data: any) {
    return this.httpClient.post(this.url + "/user_routes/get_user_data", data);
  }

  getAllLocations(): Observable<any> {
    return this.httpClient.get<Location[]>(`${this.url}/user_routes/get_all_locations`);
  }

  getAllUsers(): Observable<any> {
    return this.httpClient.get<Location[]>(`${this.url}/user_routes/get_all_users`);
  }

  gameSignUp(data: any): Observable<any> {
    return this.httpClient.post<Location[]>(`${this.url}/user_routes/game_sign_up`, data);
  }

  deleteGameSignup(data: any): Observable<any> {
    return this.httpClient.delete(`${this.url}/user_routes/delete_game_signup`, { body: data });
  }

  getAllPlayerSignups(): Observable<any> {
    return this.httpClient.get(`${this.url}/user_routes/get_all_player_signups`);
  }

  getUserCurrentGame(userId: number): Observable<any> {
    return this.httpClient.get(`${this.url}/user_routes/get_user_current_game/${userId}`);
  }

  getPlayerSignups(gameId: number): Observable<any> {
    return this.httpClient.get(`${this.url}/user_routes/get_player_signups/${gameId}`);
  }

  getLocationsWithGames(day: string): Observable<any> {
    return this.httpClient.get(`${this.url}/user_routes/get_locations_with_games/${day}`);
  }

  updateProfile(data: any): Observable<any> {
    return this.httpClient.put(`${this.url}/user_routes/update_profile`, data);
  }

  getUserRole(userId: number): Observable<any> {
    return this.httpClient.get(`${this.url}/user_routes/get_user_role/${userId}`);
  }

  getAllRoles(): Observable<any> {
    return this.httpClient.get(`${this.url}/user_routes/get_all_roles`);
  }

  updateUserRole(data: any): Observable<any> {
    return this.httpClient.put(`${this.url}/user_routes/update_user_role`, data);
  }

}