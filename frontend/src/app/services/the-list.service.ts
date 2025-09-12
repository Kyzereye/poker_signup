import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface PlayerSignup {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  signup_time: string;
}

export interface GameDetails {
  game_id: number;
  location_id: number;
  location_name: string;
  address: string;
  game_day: string;
  start_time: string;
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class TheListService {
  private url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  getGameDetails(gameId: number): Observable<GameDetails> {
    return this.httpClient.get<GameDetails>(`${this.url}/user_routes/get_game_details/${gameId}`);
  }

  getPlayerSignups(gameId: number): Observable<PlayerSignup[]> {
    return this.httpClient.get<PlayerSignup[]>(`${this.url}/user_routes/get_player_signups/${gameId}`);
  }
}
