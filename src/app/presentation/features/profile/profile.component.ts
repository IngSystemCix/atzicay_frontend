import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalEditUsersComponent } from '../../shared/modal-edit-users/modal-edit-users.component';
import { ProfileService } from '../../../core/infrastructure/api/profile.service';
import { CountryService } from '../../../core/infrastructure/api/country.service';
import { Profile } from '../../../core/domain/model/profile.model';
import { Country } from '../../../core/domain/model/country.model';
import { AuthService } from '../../../core/infrastructure/api/auth.service';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { UserSessionService } from '../../../core/infrastructure/service/user-session.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalEditUsersComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  countries: Country[] = [];
  user: Profile | null = null;
  private currentUserId: number | null = null;
  picture: string = '';
  showModal = false;
  public showNoUserMessage: boolean = false;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private countryService: CountryService,
    private auth0: Auth0Service,
    private userSession: UserSessionService
  ) {}

  ngOnInit(): void {
    this.loadCountries();
    const auth0UserRaw = sessionStorage.getItem('auth0_user');
    if (auth0UserRaw) {
      try {
        const auth0User = JSON.parse(auth0UserRaw);
        this.picture = auth0User.picture || '';
      } catch (e) {
        this.picture = '';
      }
    }
    const userId = this.userSession.getUserId();
    if (userId !== null) {
      this.currentUserId = userId;
      this.loadUserProfile(userId);
    } else {
      this.auth0.user$.subscribe((user) => {
        const email = user?.email;
        if (email) {
          this.profileService.getUserIdByEmail(email).subscribe({
            next: (res) => {
              if (res && res.data && res.data.user_id) {
                this.userSession.setUserId(res.data.user_id);
                this.currentUserId = res.data.user_id;
                this.loadUserProfile(res.data.user_id);
              } else {
                this.showNoUserMessage = true;
              }
            },
            error: (err) => {
              console.error('No se pudo obtener el id del usuario por email', err);
              this.showNoUserMessage = true;
            }
          });
        } else {
          // Si no hay email, intenta obtenerlo desde el backend usando el token guardado
          const token = sessionStorage.getItem('token_jwt');
          if (token) {
            this.authService.refreshToken(token).subscribe({
              next: (res) => {
                if (res && res.user && res.user.Id) {
                  this.userSession.setUserId(res.user.Id);
                  this.currentUserId = res.user.Id;
                  this.loadUserProfile(res.user.Id);
                }
              },
              error: (err) => {
                console.error('No se pudo refrescar el token ni obtener el id del usuario', err);
                this.showNoUserMessage = true;
              }
            });
          } else {
            this.showNoUserMessage = true;
          }
        }
      });
    }
  }

  private loadCountries(): void {
    this.countryService.getAllCountries().subscribe((res) => {
      this.countries = res.data;
    });
  }

  private loadUserProfile(userId: number) {
    this.profileService.getUserProfile(userId).subscribe({
      next: (res) => {
        console.log('Respuesta del perfil:', res);
        if (res && res.data) {
          this.user = res.data;
          this.showNoUserMessage = false;
        } else {
          this.user = null;
          this.showNoUserMessage = true;
        }
      },
      error: (error) => {
        console.error('Error al cargar perfil:', error);
        if (error.status === 404) {
          console.error('Usuario no encontrado con ID:', userId);
        }
        this.user = null;
        this.showNoUserMessage = true;
      },
    });
  }

  onUserUpdated(updatedUserData: any) {
    if (this.currentUserId) {
      const payload = {
        name: updatedUserData.name,
        last_name: updatedUserData.last_name,
        gender: updatedUserData.gender,
        birthdate: updatedUserData.birthdate,
        city: updatedUserData.city,
        country_id: updatedUserData.country_id,
      };
      this.profileService
        .updateUserProfile(this.currentUserId, payload)
        .subscribe((res) => {
          if (res && res.success && this.currentUserId !== null) {
            this.loadUserProfile(this.currentUserId);
            this.cerrarModal();
          }
        });
    }
  }

  abrirModal() {
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }

  formatMemberSince(dateString: string | undefined): string {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha no disponible';
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
