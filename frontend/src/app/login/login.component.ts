import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { UserService } from '../services/user.service';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatCardModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  login_form!: FormGroup;
  locations: any[] = [];
  users: any[] = [];

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.login_form = this.fb.group({
      email: ['kyzereye@gmail.com', Validators.required],
      password: ['1Q!azxsw2']
    });
  }

  onSubmit() {
    let form_data = this.login_form.value;
    const data = {
      email: form_data.email,
      password: form_data.password
    }
  
    this.loginService.login(data).subscribe((response: any) => {
      if (response.success === true) {
        this.userService.getUserData(data).subscribe(
          (user_data: any) => {
            console.log("User data received:", user_data);
            this.userService.setCurrentUser(user_data);
            this.authService.login();
            // Move navigation inside the user data subscription
            this.router.navigate(['/signup']);
          },
          (error) => {
            console.error("Error fetching user data:", error);
          }
        );
      }
    })
  }

  setUser(user_data: any) {
    this.userService.setCurrentUser(user_data);
  }

  getLocations() {
    this.userService.getAllLocations().subscribe({
      next: (data: any) => {
        console.log("data", data);
        this.locations = data
        this.userService.setLocations(this.locations)
      },
      error: (error) => {
        console.error('Error fetching locations:', error);
      }
    });
  }
  getAllusers() {
    this.userService.getAllUsers().subscribe({
      next: (data: any) => {
        this.users = data
      },
      error: (error) => {
        console.error('Error fetching locations:', error);
      }
    });
  }

  onLoginHelp() {
    console.log("onLoginHelp")
  }


}
