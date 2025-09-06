import { Observable, Subscription } from 'rxjs';
import { UserService } from './../../services/user.service';
import { CommonModule, NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

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
  screen_name!: string;
  private userSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.locations$ = this.userService.getAllLocations();
    this.initializeForm();
    const user_data = this.getUserData();
    console.log("userdata", user_data);

    console.log("thisusername", user_data);
  }

  getUserData() {
      this.userSubscription = this.userService.getCurrentUser().subscribe(data => {

      console.log("data", data);
      if (data) {
        this.screen_name = data[0].screen_name;
        console.log("thisusername", this.screen_name);

        this.signup_form.patchValue({
          screen_name: this.screen_name
        });
      }
    });
  }

  initializeForm() {
    this.signup_form = this.fb.group({
      username: [{ value: '', disabled: true }],
      game_location: ['', Validators.required]
    });
  }

  onSubmit() {
    let form_data = this.signup_form.getRawValue();
    this.userService.gameSignUp(form_data).subscribe(response => {
      if (response) {
        this.router.navigate(['/signup']);


      }
    });

    console.log("formdata", form_data);
  }

}


// getVenues() {
//   this.userService.getAllLocations().subscribe((response: any) => {
//     this.locations = response;
//     console.log("thislocations", this.locations);
//   })
// }