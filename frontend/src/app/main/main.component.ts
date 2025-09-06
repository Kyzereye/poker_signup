import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet, NgClass],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
isLeftSideCollapsed = input.required<boolean>();
screenWidth = input.required<number>();
sizeClass = computed(() => {
  const isLeftSidebarCollapsed = this.isLeftSideCollapsed();
  // console.log(this.screenWidth())
  if(isLeftSidebarCollapsed) {
    return '';
  }
  return this.screenWidth() > 768 ? 'body-trimmed' : 'body-md-screen';
});
}
