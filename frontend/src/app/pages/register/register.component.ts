import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule, MatSnackBarConfig } from '@angular/material/snack-bar';
import { RegisterService } from '../../services/register.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,
    MatButtonModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatCardModule, MatSnackBarModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  register_form!: FormGroup;
  hide_password: boolean = true;
  hide_confirm_password: boolean = true;
  allRequirementsMet: boolean = false;
  errorMessages: string[] = [];

  passwordRequirements = {
    min_length: false,
    has_number: false,
    has_upper_case: false,
    has_lower_case: false,
    passwords_match: false,
    has_special_character: false,
  }

  constructor(
    private fb: FormBuilder,
    private registerService: RegisterService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit() {
    this.initForm();
  }

  onSubmit() {
    if (this.register_form.valid) {
      let form_data = this.register_form.value;
      const register_data = {
        email: form_data.email,
        password: form_data.password,
        username: form_data.username,
        firstName: form_data.firstName,
        lastName: form_data.lastName
      };

      this.registerService.registerUser(register_data).subscribe({
        next: (results: any) => {
          this.errorMessages = []; // Clear any previous error messages
          if (results.email_sent) {
            this.showSuccessMessage('Registration successful! Please check your email to verify your account before logging in.');
          } else {
            this.showSuccessMessage('Registration successful! Please check your email to verify your account. If you don\'t receive an email, you can request a new verification email from the login page.');
          }
          this.router.navigate(['/login']);
        },
        error: (error: any) => {
          if (error.status === 409) {
            // Transform backend error messages to be more user-friendly
            this.errorMessages = error.error.errors.map((msg: string) => {
              if (msg.includes('User name already exists')) {
                return 'Screen name is already taken. Please choose a different one.';
              } else if (msg.includes('Email already exists')) {
                return 'Email address is already registered. Please use a different email or try logging in.';
              }
              return msg;
            });
            console.log("Registration failed:", this.errorMessages);
          } else {
            this.errorMessages = ['An unexpected error occurred. Please try again.'];
            console.error("Registration error:", error);
          }
        }
      });
    }
  }

  updatePasswordRequirements() {
    const newPassword = this.register_form.get('password')?.value || '';
    const confirmPassword = this.register_form.get('confirm_password')?.value || '';
    this.passwordRequirements = {
      min_length: newPassword.length >= 5,
      has_number: /\d/.test(newPassword),
      has_upper_case: /[A-Z]/.test(newPassword),
      has_lower_case: /[a-z]/.test(newPassword),
      has_special_character: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(newPassword),
      passwords_match: newPassword === confirmPassword && newPassword !== '',
    };
    this.allRequirementsMet = Object.values(this.passwordRequirements).every(req => req);
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirm_password')?.value
      ? null : { mismatch: true };
  }

  initForm() {
    this.register_form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]]
    }, { validator: this.passwordMatchValidator });
    this.register_form.valueChanges.subscribe(() => this.updatePasswordRequirements())
  }

  showSuccessMessage(message: string) {
    const config: MatSnackBarConfig = {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-success', 'snackbar-fade']
    };
    this.snackBar.open(message, '', config);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}
