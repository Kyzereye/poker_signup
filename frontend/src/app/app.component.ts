import { Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { LeftSidebarComponent } from './left-sidebar/left-sidebar.component';
import { MainComponent } from './main/main.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LeftSidebarComponent, MainComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Poker Sign-Up';
  isLeftSidebarCollapsed = signal<boolean>(false);
  screenWidth = signal<number>(window.innerWidth);
  showLayout = signal<boolean>(true);
  @HostListener("window: resize")
  onResize() {
    this.screenWidth.set(window.innerWidth);
    if(this.screenWidth() < 766) {
      this.isLeftSidebarCollapsed.set(true);
    } else {
      this.isLeftSidebarCollapsed.set(false);
    }
  }

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.isLeftSidebarCollapsed.set(this.screenWidth() < 768);
    this.updateLayoutVisibility();
    
    // Listen to route changes
    this.router.events.subscribe(() => {
      this.updateLayoutVisibility();
    });
  }

  private updateLayoutVisibility(): void {
    const currentUrl = this.router.url;
    // Hide layout for login and register pages
    this.showLayout.set(!currentUrl.includes('/login') && !currentUrl.includes('/register'));
  }

  changeIsLeftSidebarCollapsed(isLeftSidebarCollapsed: boolean): void {
    this.isLeftSidebarCollapsed.set(isLeftSidebarCollapsed);
  }
}
