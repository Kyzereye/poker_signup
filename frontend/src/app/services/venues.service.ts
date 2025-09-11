import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

export interface VenueDetails {
  address: string;
  game_day: string; 
  game_id: number;
  name: string;
  notes: string;
  start_time: string;
}

@Injectable({
  providedIn: 'root'
})
export class VenuesService {
  private url = environment.apiUrl;

  constructor(private http_client: HttpClient) { }

  getVenueData(venue_id: any) {
    const data = {
      venue_id: venue_id,
    };

    console.log("data", data);

    return this.http_client.post<VenueDetails[]>(this.url + "/venue_routes/get_venue_data", data, {
      headers: new HttpHeaders().set("Content-Type", "application/json")
    });
  }
}