import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  userName: string = '';
  picture: string = '';
  menuOpen: boolean = false;

  constructor(public auth: AuthService, private eRef: ElementRef) {}

  ngOnInit(): void {
    this.auth.user$.subscribe((user) => {
      if (user) {
        this.userName = user.name || '';
        this.picture = user.picture || '';
      }
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  switchAccount(): void {
    this.auth.loginWithRedirect({
      appState: {
        target: '/dashboard'
      },
      authorizationParams: {
        connection: 'google-oauth2',
        prompt: 'select_account',
      }
    });
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    }
  }
}
