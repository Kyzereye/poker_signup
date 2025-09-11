// signup componenet ts
import { Observable, Subscription } from 'rxjs';
import { UserService } from './../../services/user.service';
import { CommonModule, NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { VenuesService, VenueDetails } from '../../services/venues.service'; // Import from the service

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatCardModule, NgFor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})

export class SignupComponent implements OnInit {
  signup_form!: FormGroup;
  locations$!: Observable<any[]>;
  username!: string;
  email!: string;
  user_id!: number;
  game_location_id!: number
  private userSubscription!: Subscription;
  venue_details: VenueDetails[] | null = null;
  game_days_array: string[] = [];
  currentDay: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private venuesService: VenuesService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.locations$ = this.userService.getAllLocations();
    this.initializeForm();
    this.getUserData();
    this.getCurrentDay();

    this.signup_form.get('game_location')?.valueChanges.subscribe(locationId => {
      if (locationId) {
        this.game_location_id = locationId
        this.getVenueData(locationId);
      }
    });
  }

  getUserData() {
    this.userSubscription = this.userService.getCurrentUser().subscribe(data => {
      // console.log("getUserData data", data);
      if (data) {
        this.email = data.email;
        this.user_id = data.id;
        this.cdr.detectChanges();
      }
    });
  }

  initializeForm() {
    this.signup_form = this.fb.group({
      username: [{ value: '', disabled: true }],
      game_location: ['', Validators.required]
    });
  }

  signUpForGame(gameId: number) {
    const selected_game = this.venue_details?.find(game => game.game_id === gameId);

    if (selected_game) {
      let form_data = {
        user_id: this.user_id,
        selected_game: selected_game.game_id
      };
      
      console.log("formdata", form_data);

      // Uncomment this block once you are ready to send the data
      // this.userService.gameSignUp(form_data).subscribe(response => {
      //   if (response) {
      //     this.router.navigate(['/signup']);
      //   }
      // });
    }
  }

  getVenueData(locationId: string) {
    this.locations$.subscribe(locations => {
      const selectedLocation = locations.find(loc => loc.id === locationId);
      console.log("selectedLocation", selectedLocation);
      if (selectedLocation) {
        this.venuesService.getVenueData(selectedLocation.id).subscribe((response: VenueDetails[]) => {
          console.log("response", response);
          this.venue_details = response;
          this.cdr.detectChanges();
        });
      }
    });
  }

  getCurrentDay() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.currentDay = days[new Date().getDay()];
  }
}