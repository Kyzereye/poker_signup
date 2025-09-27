import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../services/user.service';
import { SimpleDialogComponent } from '../../components/simple-dialog/simple-dialog.component';
import { DAYS_OF_WEEK, MONTH_NAMES } from '@shared/constants';

interface PlayerSignup {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  signup_time: string;
}

interface UserGame {
  user_id: number;
  game_id: number;
  signup_time: string;
  game_day: string;
  start_time: string;
  notes: string;
  location_id: number;
  location_name: string;
  address: string;
}

@Component({
  selector: 'app-the-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './the-list.component.html',
  styleUrl: './the-list.component.scss'
})
export class TheListComponent implements OnInit, OnDestroy {
  current_user_id: number | null = null;
  has_signup = false;
  user_game: UserGame | null = null;
  player_signups: PlayerSignup[] = [];
  todays_games: any[] = [];
  current_day: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getCurrentDay();
    this.getCurrentUser();
  }

  getCurrentDay(): void {
    this.current_day = DAYS_OF_WEEK[new Date().getDay()];
  }

  getCurrentUser(): void {
    this.userService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.current_user_id = user.id;
          this.loadUserCurrentGame();
        }
      });
  }

  loadUserCurrentGame(): void {
    if (!this.current_user_id) return;

    this.userService.getUserCurrentGame(this.current_user_id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.hasSignup) {
            this.has_signup = true;
            this.user_game = response.game;
            this.loadPlayerSignupsForGame(response.game.game_id);
          } else {
            this.has_signup = false;
            this.user_game = null;
            this.player_signups = [];
            this.loadTodaysGames();
          }
        },
        error: (error) => {
          console.error('Error loading user current game:', error);
        }
      });
  }

  loadPlayerSignupsForGame(gameId: number): void {
    this.userService.getPlayerSignups(gameId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (signups) => {
          this.player_signups = signups;
        },
        error: (error) => {
          console.error('Error loading player signups:', error);
        }
      });
  }

  loadTodaysGames(): void {
    this.userService.getLocationsWithGames(this.current_day)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (locations) => {
          this.todays_games = locations;
        },
        error: (error) => {
          console.error('Error loading today\'s games:', error);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/signup']);
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }

  refreshList(): void {
    this.loadUserCurrentGame();
  }

  deleteSignup(): void {
    if (!this.current_user_id || !this.user_game) {
      return;
    }

    const dialogRef = this.dialog.open(SimpleDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to remove yourself from ${this.user_game.location_name} on ${this.user_game.game_day} at ${this.user_game.start_time}?`,
        confirmText: 'Yes, Remove Me',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performDelete();
      }
    });
  }

  private performDelete(): void {
    if (!this.current_user_id || !this.user_game) {
      return;
    }

    const data = {
      user_id: this.current_user_id,
      game_id: this.user_game.game_id
    };

    this.userService.deleteGameSignup(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUserCurrentGame(); // Refresh the list
            this.showSuccessDialog('Successfully removed from game signup!');
          }
        },
        error: (error) => {
          console.error('Error deleting signup:', error);
          this.showErrorDialog('Error removing signup. Please try again.');
        }
      });
  }

  private showSuccessDialog(message: string): void {
    this.dialog.open(SimpleDialogComponent, {
      width: '400px',
      data: {
        title: 'Success',
        message: message,
        confirmText: 'OK',
        cancelText: null
      }
    });
  }

  private showErrorDialog(message: string): void {
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

  getFormattedGameDate(): string {
    if (!this.user_game?.game_day) {
      return '';
    }
    
    const today = new Date();
    const dayName = this.user_game.game_day;
    const month = MONTH_NAMES[today.getMonth()];
    const day = today.getDate();
    
    return `${dayName} ${month} ${day}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}