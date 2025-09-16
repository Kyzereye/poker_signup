import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Venue {
  id: number;
  name: string;
  address: string;
}

export interface Game {
  id: number;
  location_id: number;
  game_day: string;
  start_time: string;
  notes?: string;
  location_name?: string;
  location_address?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VenueGameService {
  private url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  // ===== VENUE METHODS =====

  getVenues(): Observable<Venue[]> {
    return this.httpClient.get<Venue[]>(`${this.url}/api/venues/locations`);
  }

  getVenue(id: number): Observable<Venue> {
    return this.httpClient.get<Venue>(`${this.url}/api/venues/locations/${id}`);
  }

  createVenue(venue: Omit<Venue, 'id'>): Observable<any> {
    return this.httpClient.post(`${this.url}/api/venues/locations`, venue, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  updateVenue(id: number, venue: Omit<Venue, 'id'>): Observable<any> {
    return this.httpClient.put(`${this.url}/api/venues/locations/${id}`, venue, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  deleteVenue(id: number): Observable<any> {
    return this.httpClient.delete(`${this.url}/api/venues/locations/${id}`);
  }

  // ===== GAME METHODS =====

  getGames(): Observable<Game[]> {
    return this.httpClient.get<Game[]>(`${this.url}/api/venues/games`);
  }

  getGame(id: number): Observable<Game> {
    return this.httpClient.get<Game>(`${this.url}/api/venues/games/${id}`);
  }

  createGame(game: Omit<Game, 'id' | 'location_name' | 'location_address'>): Observable<any> {
    return this.httpClient.post(`${this.url}/api/venues/games`, game, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  updateGame(id: number, game: Omit<Game, 'id' | 'location_name' | 'location_address'>): Observable<any> {
    return this.httpClient.put(`${this.url}/api/venues/games/${id}`, game, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  deleteGame(id: number): Observable<any> {
    return this.httpClient.delete(`${this.url}/api/venues/games/${id}`);
  }
}
