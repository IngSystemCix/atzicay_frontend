import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalEditUsersComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit, OnDestroy {
  countries: Country[] = [];
  user: Profile | null = null;
  private currentUserId: number | null = null;
  picture: string = '';
  showModal = false;
  public showNoUserMessage: boolean = false;
  private subscription = new Subscription();
  public countriesLoaded = false; // Variable para controlar si los países están cargados

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private countryService: CountryService,
    private auth0: Auth0Service,
    private userSession: UserSessionService
  ) { }

  ngOnInit(): void {
    // Primero cargar países, luego el perfil
    this.loadCountries();
    this.loadAuth0UserPicture();
    
    // Esperar un poco para que los países se carguen antes de inicializar el perfil
    setTimeout(() => {
      this.initializeUserProfile();
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadAuth0UserPicture(): void {
    const auth0UserRaw = sessionStorage.getItem('auth0_user');
    if (auth0UserRaw) {
      try {
        const auth0User = JSON.parse(auth0UserRaw);
        this.picture = auth0User.picture || '';
      } catch (e) {
        this.picture = '';
      }
    }
  }

  private initializeUserProfile(): void {
    // Verificar si ya tenemos el userId
    const userId = this.userSession.getUserId();
    if (userId) {
      this.currentUserId = userId;
      this.loadUserProfile(userId);
    } else {
      // Esperar el token y obtener el userId
      this.subscription.add(
        this.userSession.waitForToken$(5000).subscribe({
          next: () => {
            this.handleUserAuthentication();
          },
          error: (err) => {
            console.error('[Profile] Error esperando token:', err);
            this.showNoUserMessage = true;
          }
        })
      );
    }
  }

  private handleUserAuthentication(): void {
    this.subscription.add(
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
              this.tryTokenRefresh();
            }
          });
        } else {
          this.tryTokenRefresh();
        }
      })
    );
  }

  private tryTokenRefresh(): void {
    const token = this.userSession.getToken();
    if (token) {
      this.authService.refreshToken(token).subscribe({
        next: (res) => {
          if (res && res.user && res.user.Id) {
            this.userSession.setUserId(res.user.Id);
            this.currentUserId = res.user.Id;
            this.loadUserProfile(res.user.Id);
          } else {
            this.showNoUserMessage = true;
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

  private loadCountries(): void {
    this.countryService.getAllCountries().subscribe((res) => {
      this.countries = res.data;
      this.countriesLoaded = true;
      console.log('Países cargados:', this.countries);
    });
  }

  private loadUserProfile(userId: number) {
    this.profileService.getUserProfile(userId).subscribe({
      next: (res) => {
        console.log('Respuesta del perfil:', res);
        if (res && res.data) {
          this.user = res.data;
          
          // Esperar a que los países estén cargados para asignar el country_id
          if (this.countriesLoaded && this.user && this.user.country) {
            const countryId = this.profileService.getCountryIdByName(this.user.country, this.countries);
            if (countryId) {
              this.user.country_id = countryId;
              console.log('Country ID asignado:', countryId);
            }
          } else if (!this.countriesLoaded) {
            // Si los países aún no están cargados, esperar un poco y reintentar
            setTimeout(() => {
              if (this.countriesLoaded && this.user && this.user.country) {
                const countryId = this.profileService.getCountryIdByName(this.user.country, this.countries);
                if (countryId) {
                  this.user.country_id = countryId;
                  console.log('Country ID asignado (reintento):', countryId);
                }
              }
            }, 200);
          }
          
          this.showNoUserMessage = false;
          console.log('Usuario cargado:', this.user);
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
      console.log('Datos recibidos del modal:', updatedUserData);
      
      // Mapear el género al formato esperado por el backend
      const genderMap: { [key: string]: string } = {
        'M': 'Male',
        'F': 'Female', 
        'O': 'Other'
      };
      
      // Validar y formatear los datos antes de enviar
      const payload = {
        name: updatedUserData.name?.trim() || '',
        last_name: updatedUserData.last_name?.trim() || '',
        gender: genderMap[updatedUserData.gender] || updatedUserData.gender || 'Other',
        birthdate: this.formatDateForAPI(updatedUserData.birthdate),
        city: updatedUserData.city?.trim() || '',
        country_id: parseInt(updatedUserData.country_id) || null,
      };
      
      console.log('Payload a enviar:', payload);
      
      // Validar que todos los campos requeridos estén presentes
      if (!payload.name || !payload.last_name || !payload.birthdate || !payload.city || !payload.country_id) {
        console.error('Datos incompletos:', payload);
        alert('Por favor, complete todos los campos requeridos');
        return;
      }
      
      this.profileService
        .updateUserProfile(this.currentUserId, payload)
        .subscribe({
          next: (res) => {
            console.log('Respuesta del servidor:', res);
            if (res && res.success && this.currentUserId !== null) {
              this.loadUserProfile(this.currentUserId);
              this.cerrarModal();
              alert('Perfil actualizado correctamente');
            }
          },
          error: (error) => {
            console.error('Error al actualizar perfil:', error);
            console.error('Error details:', error.error);
            if (error.status === 422) {
              alert('Error de validación: Verifique que todos los campos estén correctos');
            } else {
              alert('Error al actualizar el perfil. Intente nuevamente.');
            }
          }
        });
    }
  }

  private formatDateForAPI(dateString: string): string {
    if (!dateString) return '';
    
    // Si la fecha viene en formato YYYY-MM-DD (del input date), mantenerla así
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    
    // Si viene en otro formato, convertirla
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Fecha inválida:', dateString);
      return '';
    }
    
    // Formatear como YYYY-MM-DD
    return date.toISOString().split('T')[0];
  }

  abrirModal() {
    console.log('Abriendo modal...');
    console.log('Países cargados:', this.countriesLoaded, this.countries);
    console.log('Usuario:', this.user);
    
    if (!this.countriesLoaded) {
      console.log('Países no cargados, cargando...');
      // Si los países no están cargados, cargarlos primero
      this.countryService.getAllCountries().subscribe((res) => {
        this.countries = res.data;
        this.countriesLoaded = true;
        
        // Asignar country_id si el usuario está cargado
        if (this.user && this.user.country) {
          const countryId = this.profileService.getCountryIdByName(this.user.country, this.countries);
          if (countryId) {
            this.user.country_id = countryId;
          }
        }
        
        this.showModal = true;
      });
    } else {
      // Si los países ya están cargados, verificar que el usuario tenga country_id
      if (this.user && this.user.country && !this.user.country_id) {
        const countryId = this.profileService.getCountryIdByName(this.user.country, this.countries);
        if (countryId) {
          this.user.country_id = countryId;
        }
      }
      this.showModal = true;
    }
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
