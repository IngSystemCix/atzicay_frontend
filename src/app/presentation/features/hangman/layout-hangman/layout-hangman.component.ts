import { Component } from '@angular/core';
import {NavigationEnd, Router, RouterModule} from '@angular/router';
import {NgClass} from '@angular/common';
import {filter} from 'rxjs';
@Component({
  selector: 'app-layout-hangman',
  standalone: true,
  imports: [RouterModule, NgClass],
  templateUrl: './layout-hangman.component.html',
  styleUrl: './layout-hangman.component.css'
})
export class LayoutHangmanComponent {
  activeTab: 'content' | 'config' | 'preview' = 'content';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentUrl = this.router.url;
        if (currentUrl.includes('/content')) {
          this.activeTab = 'content';
        } else if (currentUrl.includes('/config')) {
          this.activeTab = 'config';
        } else if (currentUrl.includes('/preview')) {
          this.activeTab = 'preview';
        }
      });
  }

}
