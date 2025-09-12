import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface VenueDialogData {
  venue?: {
    id: number;
    name: string;
    address: string;
  };
  mode: 'add' | 'edit';
}

@Component({
  selector: 'app-venue-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './venue-dialog.component.html',
  styleUrl: './venue-dialog.component.scss'
})
export class VenueDialogComponent implements OnInit {
  venueForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<VenueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VenueDialogData
  ) {
    this.venueForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.venue) {
      this.venueForm.patchValue({
        name: this.data.venue.name,
        address: this.data.venue.address
      });
    }
  }

  onSubmit(): void {
    if (this.venueForm.valid) {
      this.isLoading = true;
      const formData = this.venueForm.value;

      if (this.data.mode === 'add') {
        this.addVenue(formData);
      } else {
        this.editVenue(formData);
      }
    }
  }

  private addVenue(venueData: any): void {
    const url = `${environment.apiUrl}/venue_routes/locations`;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    this.http.post(url, venueData, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.snackBar.open('Venue added successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.dialogRef.close({ success: true, data: response });
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error adding venue:', error);
        this.snackBar.open(
          error.error?.error || 'Failed to add venue. Please try again.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          }
        );
      }
    });
  }

  private editVenue(venueData: any): void {
    if (!this.data.venue?.id) return;

    const url = `${environment.apiUrl}/venue_routes/locations/${this.data.venue.id}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    this.http.put(url, venueData, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.snackBar.open('Venue updated successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.dialogRef.close({ success: true, data: response });
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error updating venue:', error);
        this.snackBar.open(
          error.error?.error || 'Failed to update venue. Please try again.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          }
        );
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }
}
