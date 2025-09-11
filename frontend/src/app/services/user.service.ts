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
    return this.httpClient.post(this.url + "/user_routes/get_user_data", data, {
      headers: new HttpHeaders().set("Content-Type", "application/json")
    });
  }

  getAllLocations(): Observable<any> {
    return this.httpClient.get<Location[]>(`${this.url}/user_routes/get_all_locations`, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getAllUsers(): Observable<any> {
    return this.httpClient.get<Location[]>(`${this.url}/user_routes/get_all_users`, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  gameSignUp(data: any): Observable<any> {
    return this.httpClient.post<Location[]>(`${this.url}/user_routes/game_sign_up`, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }


}