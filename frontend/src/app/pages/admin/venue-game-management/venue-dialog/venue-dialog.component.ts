import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';

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
    MatSelectModule,
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
  
  // US States list with Colorado as default
  states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<VenueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VenueDialogData
  ) {
    this.venueForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      streetAddress: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['Colorado', [Validators.required]], // Colorado as default
      zip: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]]
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.venue) {
      // Parse the existing address back into separate fields
      const addressParts = this.parseAddress(this.data.venue.address);
      this.venueForm.patchValue({
        name: this.data.venue.name,
        streetAddress: addressParts.streetAddress,
        city: addressParts.city,
        state: addressParts.state,
        zip: addressParts.zip
      });
    }
  }

  onSubmit(): void {
    if (this.venueForm.valid) {
      this.isLoading = true;
      const formData = this.venueForm.value;
      
      // Format the address from separate fields
      const venueData = {
        name: formData.name,
        address: this.formatAddress(formData.streetAddress, formData.city, formData.state, formData.zip)
      };

      if (this.data.mode === 'add') {
        this.addVenue(venueData);
      } else {
        this.editVenue(venueData);
      }
    }
  }

  private addVenue(venueData: any): void {
    const url = `${environment.apiUrl}/api/venues/locations`;
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

    const url = `${environment.apiUrl}/api/venues/locations/${this.data.venue.id}`;
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

  // Helper method to format address from separate fields
  private formatAddress(streetAddress: string, city: string, state: string, zip: string): string {
    return `${streetAddress.trim()}, ${city.trim()}, ${state.trim()} ${zip.trim()}`;
  }

  // Helper method to parse existing address back into separate fields
  private parseAddress(address: string): { streetAddress: string; city: string; state: string; zip: string } {
    // Simple parsing - assumes format: "street, city, state zip"
    const parts = address.split(',').map(part => part.trim());
    
    if (parts.length >= 3) {
      const streetAddress = parts[0];
      const city = parts[1];
      const stateZip = parts[2].split(' ');
      const state = stateZip[0] || 'Colorado';
      const zip = stateZip[1] || '';
      
      return { streetAddress, city, state, zip };
    }
    
    // Fallback if parsing fails
    return { 
      streetAddress: address, 
      city: '', 
      state: 'Colorado', 
      zip: '' 
    };
  }
}
