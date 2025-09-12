import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Subject, takeUntil } from 'rxjs';
import { ProfileEditDialogComponent } from '../../components/profile-edit-dialog/profile-edit-dialog.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  profileForm: FormGroup;
  currentUser: any = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private dialog: MatDialog
  ) {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[0-9\\-\\+\\(\\)\\s]+$')]],
      screenName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]]
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserData() {
    this.userService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(userData => {
        this.currentUser = userData;
        console.log('Current user data:', this.currentUser); // Debug log
      });
  }

  openEditDialog() {
    const dialogRef = this.dialog.open(ProfileEditDialogComponent, {
      width: '500px',
      data: { 
        user: this.currentUser,
        form: this.profileForm 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh user data after successful edit
        this.loadUserData();
      }
    });
  }
}
