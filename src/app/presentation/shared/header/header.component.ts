import {Component, OnInit, ElementRef, HostListener, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import {SidebarService} from '../../../core/infrastructure/api/sidebar/sidebar.service';

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
  private sidebarService = inject(SidebarService);

  constructor(public auth: AuthService, private eRef: ElementRef) {}

  ngOnInit(): void {
    this.auth.user$.subscribe((user) => {
      if (user) {
        this.userName = user.name || '';
        this.picture = user.picture || '';
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
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
