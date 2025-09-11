import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { UserService } from '../../services/user.service';
import { VenuesService, VenueDetails } from '../../services/venues.service';
import { SimpleDialogComponent } from '../../components/simple-dialog/simple-dialog.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule, NgFor],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})

export class SignupComponent implements OnInit, OnDestroy {
  signup_form!: FormGroup;
  locations$!: Observable<any[]>;
  user_id!: number;
  game_location_id!: number;
  venue_details: VenueDetails[] | null = null;
  currentDay: string = '';
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

    this.signup_form.get('game_location')?.valueChanges.subscribe(locationId => {
      if (locationId) {
        this.game_location_id = locationId;
        this.getVenueData(locationId);
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
      game_location: ['', Validators.required]
    });
  }

  signUpForGame(gameId: number): void {
    const selected_game = this.venue_details?.find(game => game.game_id === gameId);

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
              this.router.navigate(['/the-list', selected_game.game_id]);
            }
          },
          error: (error) => {
            console.error('Error signing up for game:', error);
            if (error.status === 409) {
              this.showAlreadySignedUpDialog(selected_game.game_id);
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

  trackByVenueId(index: number, venue: VenueDetails): number {
    return venue.game_id;
  }

  shouldGrayOut(venue: VenueDetails): boolean {
    return venue.game_day !== this.currentDay;
  }

  showAlreadySignedUpDialog(gameId: number): void {
    const dialogRef = this.dialog.open(SimpleDialogComponent, {
      width: '400px',
      data: {
        title: 'Already Signed Up',
        message: 'You are already signed up for this game!',
        confirmText: 'View List',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/the-list', gameId]);
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