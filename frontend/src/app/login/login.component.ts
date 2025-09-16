// frontend/login.component.ts
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
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogComponent } from '../components/simple-dialog/simple-dialog.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatCardModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  login_form!: FormGroup;
  locations: any[] = [];
  users: any[] = [];
  hide_password: boolean = true;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.login_form = this.fb.group({
      email: ['', Validators.required],
      password: ['']
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
        this.userService.setCurrentUser(response.user_data);
        this.authService.login(response.user_data);
        this.router.navigate(['/signup']);
      }
    }, (error) => {
      console.error("Login error:", error);
      this.showLoginError(error);
    });
}

private showLoginError(error: any): void {
  // Generic error message for security - don't reveal if email exists or password is wrong
  const errorMessage = 'Login credentials are incorrect. Please check your email and password and try again.';

  this.dialog.open(SimpleDialogComponent, {
    width: '400px',
    data: {
      title: 'Login Failed',
      message: errorMessage,
      confirmText: 'OK',
      cancelText: null
    }
  });
}

  getLocations() {
    this.userService.getAllLocations().subscribe({
      next: (data: any) => {
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

  goToRegister() {
    this.router.navigate(['/register']);
  }


}
