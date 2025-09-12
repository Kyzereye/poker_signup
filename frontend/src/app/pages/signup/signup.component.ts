import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { UserService } from '../../services/user.service';
import { VenuesService, VenueDetails } from '../../services/venues.service';
import { SimpleDialogComponent } from '../../components/simple-dialog/simple-dialog.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule, MatIconModule, NgFor],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})

export class SignupComponent implements OnInit, OnDestroy {
  signup_form!: FormGroup;
  locations$!: Observable<any[]>;
  user_id!: number;
  game_location_id!: number;
  venue_details: VenueDetails[] | null = null;
  all_todays_games: any[] = []; // All games for selected day
  currentDay: string = '';
  selectedDay: string = ''; // The day selected in the filter
  show_all_games = true; // Flag to show all games or filtered games
  days_of_week: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private venuesService: VenuesService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.locations$ = this.userService.getAllLocations();
    this.initializeForm();
    this.getUserData();
    this.getCurrentDay();
    this.selectedDay = this.currentDay; // Default to today
    this.loadGamesForDay(this.selectedDay); // Load games for selected day

    this.signup_form.get('game_location')?.valueChanges.subscribe(locationId => {
      if (locationId) {
        this.game_location_id = locationId;
        this.show_all_games = false;
        this.getVenueData(locationId);
      } else {
        // If no location selected, show all games for selected day
        this.show_all_games = true;
        this.venue_details = null;
        this.loadGamesForDay(this.selectedDay);
      }
    });

    this.signup_form.get('selected_day')?.valueChanges.subscribe(day => {
      if (day) {
        this.selectedDay = day;
        if (this.show_all_games) {
          this.loadGamesForDay(day);
        } else {
          // If filtering by location, reload venue data for the new day
          this.getVenueData(this.game_location_id.toString());
        }
      }
    });
  }

  getUserData(): void {
    this.userService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          this.user_id = data.id;
        }
      });
  }

  initializeForm(): void {
    this.signup_form = this.fb.group({
      username: [{ value: '', disabled: true }],
      game_location: [''], // Optional location filter
      selected_day: [this.currentDay] // Day filter, defaults to today
    });
  }

  signUpForGame(gameId: number): void {
    let selected_game;
    
    if (this.show_all_games) {
      // Find game in all today's games
      for (const location of this.all_todays_games) {
        selected_game = location.games.find((game: any) => game.game_id === gameId);
        if (selected_game) {
          selected_game.location_name = location.name;
          selected_game.location_id = location.id;
          break;
        }
      }
    } else {
      // Find game in filtered venue details
      selected_game = this.venue_details?.find(game => game.game_id === gameId);
    }

    if (selected_game) {
      const form_data = {
        user_id: this.user_id,
        selected_game: selected_game.game_id
      };

      this.userService.gameSignUp(form_data)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.router.navigate(['/the-list']);
            }
          },
          error: (error) => {
            console.error('Error signing up for game:', error);
            if (error.status === 409) {
              this.showAlreadySignedUpDialog(error.error, selected_game);
            } else {
              this.showErrorDialog('Error signing up for game. Please try again.');
            }
          }
        });
    }
  }

  getVenueData(locationId: string): void {
    this.locations$
      .pipe(takeUntil(this.destroy$))
      .subscribe((locations: any[]) => {
        const selectedLocation = locations.find((loc: any) => loc.id === locationId);
        if (selectedLocation) {
          this.venuesService.getVenueData(selectedLocation.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe((response: VenueDetails[]) => {
              this.venue_details = response;
            });
        }
      });
  }

  getCurrentDay(): void {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.currentDay = days[new Date().getDay()];
  }

  loadGamesForDay(day: string): void {
    this.userService.getLocationsWithGames(day)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (locations) => {
          this.all_todays_games = locations;
        },
        error: (error) => {
          console.error('Error loading games for day:', error);
        }
      });
  }

  trackByVenueId(index: number, venue: VenueDetails): number {
    return venue.game_id;
  }

  trackByGameId(index: number, game: any): number {
    return game.game_id;
  }

  shouldGrayOut(venue: VenueDetails): boolean {
    return venue.game_day !== this.currentDay;
  }

  shouldGrayOutGame(game: any): boolean {
    return game.game_day !== this.currentDay;
  }

  canSignUpForGame(game: any): boolean {
    return game.game_day === this.currentDay;
  }

  getCurrentGamesList(): any[] {
    if (this.show_all_games) {
      // Flatten all games from all locations
      const allGames: any[] = [];
      this.all_todays_games.forEach(location => {
        location.games.forEach((game: any) => {
          allGames.push({
            ...game,
            location_name: location.name,
            location_id: location.id,
            address: location.address
          });
        });
      });
      return allGames;
    } else {
      return this.venue_details || [];
    }
  }

  showAlreadySignedUpDialog(errorData: any, selectedGame: any): void {
    let message: string;
    let title: string;

    // Check if they're trying to sign up for the same game they're already signed up for
    if (errorData.currentGame && selectedGame && errorData.currentGame.game_id === selectedGame.game_id) {
      title = 'Already Signed Up';
      message = `You are already signed up for ${errorData.currentGame.location_name} on ${errorData.currentGame.game_day} at ${errorData.currentGame.start_time}.`;
    } else {
      // They're signed up for a different game
      title = 'Already Signed Up for Another Game';
      message = `You are already signed up for ${errorData.currentGame.location_name} on ${errorData.currentGame.game_day} at ${errorData.currentGame.start_time}. Please delete your current signup before signing up for another game.`;
    }

    const dialogRef = this.dialog.open(SimpleDialogComponent, {
      width: '500px',
      data: {
        title: title,
        message: message,
        confirmText: 'View My Game',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/the-list']);
      }
    });
  }

  showErrorDialog(message: string): void {
    this.dialog.open(SimpleDialogComponent, {
      width: '400px',
      data: {
        title: 'Error',
        message: message,
        confirmText: 'OK',
        cancelText: null
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}