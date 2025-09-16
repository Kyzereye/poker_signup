import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private url = environment.apiUrl;
  user_data = new BehaviorSubject<any>(null);
  location_data = new BehaviorSubject<any>(null);

  constructor(private httpClient: HttpClient) { }

  registerUser(data: any) {
    return this.httpClient.post(this.url + "/api/auth/user_registration", data, {
      headers: new HttpHeaders().set("Content-Type", "application/json")
    })
  }

}
