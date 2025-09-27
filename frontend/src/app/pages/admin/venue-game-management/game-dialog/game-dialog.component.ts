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
import { DAYS_OF_WEEK } from '@shared/constants';

export interface GameDialogData {
  game?: {
    id: number;
    location_id: number;
    game_day: string;
    start_time: string;
    notes: string;
  };
  mode: 'add' | 'edit';
}

@Component({
  selector: 'app-game-dialog',
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
  templateUrl: './game-dialog.component.html',
  styleUrl: './game-dialog.component.scss'
})
export class GameDialogComponent implements OnInit {
  gameForm: FormGroup;
  isLoading = false;
  venues: any[] = [];
  
  // Game days of the week
  gameDays: readonly string[] = DAYS_OF_WEEK;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<GameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GameDialogData
  ) {
    this.gameForm = this.fb.group({
      location_id: ['', [Validators.required]],
      game_day: ['', [Validators.required]],
      start_time: ['', [Validators.required]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadVenues();
    
    if (this.data.mode === 'edit' && this.data.game) {
      this.gameForm.patchValue({
        location_id: this.data.game.location_id,
        game_day: this.data.game.game_day,
        start_time: this.data.game.start_time,
        notes: this.data.game.notes || ''
      });
    }
  }

  private loadVenues(): void {
    const url = `${environment.apiUrl}/api/venues/locations`;
    this.http.get<any[]>(url).subscribe({
      next: (venues) => {
        this.venues = venues;
      },
      error: (error) => {
        console.error('Error loading venues:', error);
        this.snackBar.open('Error loading venues', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.gameForm.valid) {
      this.isLoading = true;
      const formData = this.gameForm.value;

      if (this.data.mode === 'add') {
        this.addGame(formData);
      } else {
        this.editGame(formData);
      }
    }
  }

  private addGame(gameData: any): void {
    const url = `${environment.apiUrl}/api/venues/games`;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    this.http.post(url, gameData, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.snackBar.open('Game added successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.dialogRef.close({ success: true, data: response });
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error adding game:', error);
        this.snackBar.open(
          error.error?.error || 'Failed to add game. Please try again.',
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

  private editGame(gameData: any): void {
    if (!this.data.game?.id) return;

    const url = `${environment.apiUrl}/api/venues/games/${this.data.game.id}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    this.http.put(url, gameData, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.snackBar.open('Game updated successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.dialogRef.close({ success: true, data: response });
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error updating game:', error);
        this.snackBar.open(
          error.error?.error || 'Failed to update game. Please try again.',
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
