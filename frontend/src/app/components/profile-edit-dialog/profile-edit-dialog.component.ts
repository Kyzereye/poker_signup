import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile-edit-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Edit Profile</h2>
      <button mat-icon-button mat-dialog-close class="close-button">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="dialog-form">
      <div class="form-group">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email Address</mat-label>
          <input matInput 
                 formControlName="email" 
                 type="email" 
                 placeholder="Enter your email address" />
          <mat-error *ngIf="editForm.get('email')?.hasError('required')">Email is required</mat-error>
          <mat-error *ngIf="editForm.get('email')?.hasError('email')">Please enter a valid email address</mat-error>
        </mat-form-field>
      </div>

      <div class="form-group">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Screen Name</mat-label>
          <input matInput 
                 formControlName="screenName" 
                 placeholder="Choose your display name" />
          <mat-hint>This is how other players will see you</mat-hint>
          <mat-error *ngIf="editForm.get('screenName')?.hasError('required')">Screen name is required</mat-error>
        </mat-form-field>
      </div>

      <div class="form-group">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>First Name</mat-label>
          <input matInput 
                 formControlName="firstName" 
                 placeholder="Enter your first name" />
          <mat-error *ngIf="editForm.get('firstName')?.hasError('required')">First name is required</mat-error>
        </mat-form-field>
      </div>

      <div class="form-group">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Last Name</mat-label>
          <input matInput 
                 formControlName="lastName" 
                 placeholder="Enter your last name" />
          <mat-error *ngIf="editForm.get('lastName')?.hasError('required')">Last name is required</mat-error>
        </mat-form-field>
      </div>

      <div class="form-group">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Phone Number</mat-label>
          <input matInput 
                 formControlName="phone" 
                 type="tel" 
                 placeholder="Enter your phone number" />
          <mat-hint>Optional - for notifications and contact</mat-hint>
          <mat-error *ngIf="editForm.get('phone')?.hasError('pattern')">Please enter a valid phone number</mat-error>
        </mat-form-field>
      </div>

      <div class="dialog-actions">
        <button mat-stroked-button 
                type="button" 
                class="cancel-button"
                (click)="onCancel()">
          <mat-icon>close</mat-icon>
          Cancel
        </button>
        
        <button mat-raised-button 
                color="primary" 
                type="submit" 
                class="save-button"
                [disabled]="!editForm.valid || isSubmitting">
          <mat-icon *ngIf="!isSubmitting">save</mat-icon>
          <mat-icon *ngIf="isSubmitting" class="spinning">refresh</mat-icon>
          {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 1.5rem 0 1.5rem;
      border-bottom: 1px solid var(--border-light);
      margin-bottom: 1.5rem;
    }

    .dialog-header h2 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.5rem;
      font-weight: 600;
    }

    .close-button {
      color: var(--text-secondary);
    }

    .dialog-form {
      padding: 0 1.5rem 1.5rem 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .full-width {
      width: 100%;
    }

    .dialog-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-light);
    }

    .save-button {
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      padding: 0.75rem 2rem;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .save-button:hover:not(:disabled) {
      background: var(--primary-dark);
      transform: translateY(-1px);
      box-shadow: var(--shadow-medium);
    }

    .save-button:disabled {
      background: var(--text-disabled);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .cancel-button {
      color: var(--text-secondary);
      border: 2px solid var(--border-light);
      border-radius: var(--border-radius);
      padding: 0.75rem 2rem;
      font-size: 1rem;
      font-weight: 500;
      background: transparent;
      transition: all 0.2s ease;
    }

    .cancel-button:hover {
      border-color: var(--text-secondary);
      background: var(--background-tertiary);
      transform: translateY(-1px);
    }

    .save-button mat-icon,
    .cancel-button mat-icon {
      margin-right: 0.5rem;
    }

    mat-hint {
      color: var(--text-secondary);
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class ProfileEditDialogComponent implements OnInit {
  editForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ProfileEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.editForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[0-9\\-\\+\\(\\)\\s]+$')]],
      screenName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]]
    });
  }

  ngOnInit() {
    if (this.data.user) {
      this.editForm.patchValue({
        email: this.data.user.email || '',
        screenName: this.data.user.username || '',
        phone: this.data.user.phone || '',
        firstName: this.data.user.first_name || '',
        lastName: this.data.user.last_name || ''
      });
    }
  }

  onSubmit() {
    if (this.editForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.editForm.value;
      
      // Prepare the data for the backend
      const updateData = {
        user_id: this.data.user.id,
        email: formData.email,
        screenName: formData.screenName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      };

      this.userService.updateProfile(updateData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.snackBar.open('Profile updated successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          
          // Update the user data in the service
          const updatedUser = {
            ...this.data.user,
            email: formData.email,
            username: formData.screenName,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone
          };
          this.userService.setCurrentUser(updatedUser);
          
          // Close the dialog with success
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Profile update error:', error);
          
          let errorMessage = 'Failed to update profile. Please try again.';
          if (error.status === 409) {
            errorMessage = error.error.error || errorMessage;
          } else if (error.status === 400) {
            errorMessage = 'Invalid data provided. Please check your inputs.';
          }
          
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      console.log("Form is invalid or already submitting");
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
