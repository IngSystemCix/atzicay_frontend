import {Component, OnInit, ElementRef, HostListener, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import {SidebarService} from '../../../core/infrastructure/api/sidebar/sidebar.service';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=Usuario&background=cccccc&color=222222&size=128';

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
        this.picture = user.picture || DEFAULT_AVATAR;
        // Guarda en sessionStorage para persistencia
        sessionStorage.setItem('auth0_user', JSON.stringify({
          name: this.userName,
          picture: this.picture
        }));
      } else {
        // Si no hay usuario de Auth0, intenta cargar del backend/sessionStorage
        const auth0UserRaw = sessionStorage.getItem('auth0_user');
        if (auth0UserRaw) {
          try {
            const auth0User = JSON.parse(auth0UserRaw);
            this.userName = auth0User.name || '';
            this.picture = auth0User.picture || DEFAULT_AVATAR;
          } catch (e) {
            this.userName = '';
            this.picture = DEFAULT_AVATAR;
          }
        } else {
          const backendUserRaw = sessionStorage.getItem('user');
          if (backendUserRaw) {
            try {
              const backendUser = JSON.parse(backendUserRaw);
              this.userName = backendUser.Name || backendUser.name || '';
              this.picture = DEFAULT_AVATAR;
            } catch (e) {
              this.userName = '';
              this.picture = DEFAULT_AVATAR;
            }
          } else {
            this.userName = '';
            this.picture = DEFAULT_AVATAR;
          }
        }
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
