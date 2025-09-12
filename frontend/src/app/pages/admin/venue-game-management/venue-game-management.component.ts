import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
// Note: Using direct HttpClient calls instead of VenueGameService due to import issues
// import { VenueGameService, Venue, Game } from '../../../services';

// Define interfaces locally for now
export interface Venue {
  id: number;
  name: string;
  address: string;
}

export interface Game {
  id: number;
  location_id: number;
  game_day: string;
  start_time: string;
  notes?: string;
  location_name?: string;
  location_address?: string;
}
import { VenueDialogComponent, VenueDialogData } from './venue-dialog/venue-dialog.component';
import { DeleteConfirmationDialogComponent, DeleteConfirmationData } from './delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-venue-game-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule
  ],
  templateUrl: './venue-game-management.component.html',
  styleUrl: './venue-game-management.component.scss'
})
export class VenueGameManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data properties
  venues: Venue[] = [];
  games: Game[] = [];
  filteredVenues: Venue[] = [];
  filteredGames: Game[] = [];
  
  // Loading states
  venuesLoading = false;
  gamesLoading = false;
  
  // Search and sort properties
  venueSearchTerm = '';
  gameSearchTerm = '';
  venueSort: Sort = { active: 'name', direction: 'asc' };
  gameSort: Sort = { active: 'location_name', direction: 'asc' };
  
  // Table columns
  venueColumns: string[] = ['name', 'address', 'actions'];
  gameColumns: string[] = ['location_name', 'game_day', 'start_time', 'notes', 'actions'];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadVenues();
    this.loadGames();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadVenues() {
    this.venuesLoading = true;
    const url = `${environment.apiUrl}/venue_routes/locations`;
    
    this.http.get<Venue[]>(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (venues: Venue[]) => {
          this.venues = venues;
          this.filteredVenues = [...venues];
          this.applyVenueFilters();
          this.venuesLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading venues:', error);
          this.snackBar.open('Error loading venues', 'Close', { duration: 3000 });
          this.venuesLoading = false;
        }
      });
  }

  loadGames() {
    this.gamesLoading = true;
    const url = `${environment.apiUrl}/venue_routes/games`;
    
    this.http.get<Game[]>(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (games: Game[]) => {
          this.games = games;
          this.filteredGames = [...games];
          this.applyGameFilters();
          this.gamesLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading games:', error);
          this.snackBar.open('Error loading games', 'Close', { duration: 3000 });
          this.gamesLoading = false;
        }
      });
  }

  // Venue actions
  addVenue() {
    const dialogData: VenueDialogData = {
      mode: 'add'
    };

    const dialogRef = this.dialog.open(VenueDialogComponent, {
      data: dialogData,
      width: '600px',
      maxWidth: '90vw',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.loadVenues(); // Refresh the venues list
      }
    });
  }

  editVenue(venue: Venue) {
    const dialogData: VenueDialogData = {
      mode: 'edit',
      venue: venue
    };

    const dialogRef = this.dialog.open(VenueDialogComponent, {
      data: dialogData,
      width: '600px',
      maxWidth: '90vw',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.loadVenues(); // Refresh the venues list
      }
    });
  }

  deleteVenue(venue: Venue) {
    const dialogData: DeleteConfirmationData = {
      title: 'Delete Venue',
      message: 'Are you sure you want to delete this venue? This action cannot be undone.',
      itemName: venue.name,
      itemType: 'Venue',
      isDeleting: false
    };

    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: dialogData,
      width: '450px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmed) {
        this.performDeleteVenue(venue);
      }
    });
  }

  private performDeleteVenue(venue: Venue): void {
    const url = `${environment.apiUrl}/venue_routes/locations/${venue.id}`;
    
    this.http.delete(url).subscribe({
      next: (response: any) => {
        this.snackBar.open('Venue deleted successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.loadVenues(); // Refresh the venues list
      },
      error: (error: any) => {
        console.error('Error deleting venue:', error);
        let errorMessage = 'Failed to delete venue. Please try again.';
        
        if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = 'Cannot delete venue with associated games. Please remove games first.';
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  // Game actions
  addGame() {
    this.snackBar.open('Add Game - Coming soon!', 'Close', { duration: 2000 });
  }

  editGame(game: Game) {
    this.snackBar.open(`Edit Game: ${game.location_name} - Coming soon!`, 'Close', { duration: 2000 });
  }

  deleteGame(game: Game) {
    this.snackBar.open(`Delete Game: ${game.location_name} - Coming soon!`, 'Close', { duration: 2000 });
  }


  // Search and filter methods
  onVenueSearchChange(searchTerm: string): void {
    this.venueSearchTerm = searchTerm;
    this.applyVenueFilters();
  }

  onGameSearchChange(searchTerm: string): void {
    this.gameSearchTerm = searchTerm;
    this.applyGameFilters();
  }

  onVenueSortChange(sort: Sort): void {
    // If clicking the same column, toggle between asc and desc
    if (this.venueSort.active === sort.active) {
      if (this.venueSort.direction === 'asc') {
        this.venueSort = { active: sort.active, direction: 'desc' };
      } else {
        this.venueSort = { active: sort.active, direction: 'asc' };
      }
    } else {
      // New column, start with ascending
      this.venueSort = { active: sort.active, direction: 'asc' };
    }
    this.applyVenueFilters();
  }

  onGameSortChange(sort: Sort): void {
    // If clicking the same column, toggle between asc and desc
    if (this.gameSort.active === sort.active) {
      if (this.gameSort.direction === 'asc') {
        this.gameSort = { active: sort.active, direction: 'desc' };
      } else {
        this.gameSort = { active: sort.active, direction: 'asc' };
      }
    } else {
      // New column, start with ascending
      this.gameSort = { active: sort.active, direction: 'asc' };
    }
    this.applyGameFilters();
  }

  private applyVenueFilters(): void {
    let filtered = [...this.venues];

    // Apply search filter
    if (this.venueSearchTerm.trim()) {
      const searchLower = this.venueSearchTerm.toLowerCase();
      filtered = filtered.filter(venue => 
        venue.name.toLowerCase().includes(searchLower) ||
        venue.address.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const isAsc = this.venueSort.direction === 'asc';
      let valueA: any, valueB: any;

      switch (this.venueSort.active) {
        case 'name':
          valueA = a.name;
          valueB = b.name;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) {
        return isAsc ? -1 : 1;
      }
      if (valueA > valueB) {
        return isAsc ? 1 : -1;
      }
      return 0;
    });

    this.filteredVenues = filtered;
  }

  private applyGameFilters(): void {
    let filtered = [...this.games];

    // Apply search filter
    if (this.gameSearchTerm.trim()) {
      const searchLower = this.gameSearchTerm.toLowerCase();
      filtered = filtered.filter(game => 
        (game.location_name || '').toLowerCase().includes(searchLower) ||
        game.game_day.toLowerCase().includes(searchLower) ||
        game.start_time.toLowerCase().includes(searchLower) ||
        (game.notes || '').toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const isAsc = this.gameSort.direction === 'asc';
      let valueA: any, valueB: any;

      switch (this.gameSort.active) {
        case 'location_name':
          valueA = a.location_name || '';
          valueB = b.location_name || '';
          break;
        case 'game_day':
          valueA = a.game_day;
          valueB = b.game_day;
          break;
        case 'start_time':
          valueA = a.start_time;
          valueB = b.start_time;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) {
        return isAsc ? -1 : 1;
      }
      if (valueA > valueB) {
        return isAsc ? 1 : -1;
      }
      return 0;
    });

    this.filteredGames = filtered;
  }
}
