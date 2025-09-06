import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private url = environment.apiUrl;
  user_data = new BehaviorSubject<any>(null);
  location_data = new BehaviorSubject<any>(null);

  constructor(private httpClient: HttpClient) { }

  login(data: any) {
    return this.httpClient.post(this.url + "/login", data, {
      headers: new HttpHeaders().set("Content-Type", "application/json")
    })
  }
}
