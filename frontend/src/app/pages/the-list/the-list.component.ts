import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { TheListService, PlayerSignup, GameDetails } from '../../services/the-list.service';

@Component({
  selector: 'app-the-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  providers: [TheListService],
  templateUrl: './the-list.component.html',
  styleUrl: './the-list.component.scss'
})
export class TheListComponent implements OnInit, OnDestroy {
  game_id!: number;
  game_details: GameDetails | null = null;
  player_signups: PlayerSignup[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(TheListService) private theListService: TheListService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.game_id = +params['gameId'];
        if (this.game_id) {
          this.loadGameDetails();
          this.loadPlayerSignups();
        }
      });
  }

  loadGameDetails(): void {
    this.theListService.getGameDetails(this.game_id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details) => {
          this.game_details = details;
        },
        error: (error) => {
          console.error('Error loading game details:', error);
        }
      });
  }

  loadPlayerSignups(): void {
    this.theListService.getPlayerSignups(this.game_id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (signups) => {
          this.player_signups = signups;
        },
        error: (error) => {
          console.error('Error loading player signups:', error);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/signup']);
  }

  refreshList(): void {
    this.loadPlayerSignups();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
