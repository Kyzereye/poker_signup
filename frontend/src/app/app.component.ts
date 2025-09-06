import { Component, HostListener, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LeftSidebarComponent } from './left-sidebar/left-sidebar.component';
import { MainComponent } from './main/main.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LeftSidebarComponent, MainComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Poker Sign-Up';
  isLeftSidebarCollapsed = signal<boolean>(false);
screenWidth = signal<number>(window.innerWidth);
  @HostListener("window: resize")
  onResize() {
    this.screenWidth.set(window.innerWidth);
    if(this.screenWidth() < 766) {
      this.isLeftSidebarCollapsed.set(true);
    } else {
      this.isLeftSidebarCollapsed.set(false);
    }
  }

  ngOnInit(): void {
    this.isLeftSidebarCollapsed.set(this.screenWidth() < 768);
  }

  changeIsLeftSidebarCollapsed(isLeftSidebarCollapsed: boolean): void {
    this.isLeftSidebarCollapsed.set(isLeftSidebarCollapsed);
  }
}
