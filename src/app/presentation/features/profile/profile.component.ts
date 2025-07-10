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
import { AlertService } from '../../../core/infrastructure/service/alert.service';
import { Subscription } from 'rxjs';
import { GameTypeCountsService } from '../../../core/infrastructure/api/game-type-counts.service';
import { GameTypeCounts } from '../../../core/domain/model/game-type-counts.model';

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

  public totalGamesCreated: number = 0;
  private gameTypeCounts: GameTypeCounts | null = null;

  public averageRating: number = 0; // Esto vendrá del endpoint
  public currentRank: string = 'Bronce';
  public rankIcon: string = '';
  public rankColor: string = '';

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private countryService: CountryService,
    private auth0: Auth0Service,
    private userSession: UserSessionService,
    private alertService: AlertService,
    private gameTypeCountsService: GameTypeCountsService
  ) {}

  ngOnInit(): void {
    // Primero cargar países, luego el perfil
    this.loadCountries();
    this.loadAuth0UserPicture();
    this.simulateRatingData();

    // Esperar un poco para que los países se carguen antes de inicializar el perfil
    setTimeout(() => {
      this.initializeUserProfile();
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private simulateRatingData(): void {
    // Simula un promedio de calificación para mostrar la barra y el porcentaje
    const simulatedRating = 2.8; // Cambia este valor para probar diferentes rangos
    this.updateRankInfo(simulatedRating);
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

  private calculateRank(rating: number): {
    rank: string;
    icon: string;
    color: string;
  } {
    if (rating >= 4.5) {
      return {
        rank: 'Diamante',
        icon: '💎',
        color: 'text-blue-600',
      };
    } else if (rating >= 3.5) {
      return {
        rank: 'Oro',
        icon: '🏆',
        color: 'text-yellow-600',
      };
    } else if (rating >= 2.5) {
      return {
        rank: 'Plata',
        icon: '🥈',
        color: 'text-gray-600',
      };
    } else {
      return {
        rank: 'Bronce',
        icon: '🥉',
        color: 'text-orange-600',
      };
    }
  }

  private updateRankInfo(rating: number): void {
    this.averageRating = rating;
    const rankInfo = this.calculateRank(rating);
    this.currentRank = rankInfo.rank;
    this.rankIcon = rankInfo.icon;
    this.rankColor = rankInfo.color;
  }

  getStarFillPercentage(starNumber: number): number {
    const rating = this.averageRating;

    if (rating >= starNumber) {
      // Estrella completamente llena
      return 100;
    } else if (rating >= starNumber - 1) {
      // Estrella parcialmente llena
      const remainder = rating - (starNumber - 1);
      return remainder * 100;
    } else {
      // Estrella vacía
      return 0;
    }
  }

  private initializeUserProfile(): void {
    // Verificar si ya tenemos el userId
    const userId = this.userSession.getUserId();
    if (userId) {
      this.currentUserId = userId;
      this.loadUserProfile(userId);
      this.loadUserGameCounts(userId);
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
          },
        })
      );
    }
  }

  getProgressPercentage(): number {
    // La barra debe mostrar el avance dentro del rango actual
    // Ejemplo: Bronce (1.0-2.5), Plata (2.5-3.5), Oro (3.5-4.5), Diamante (4.5-5.0)
    const rating = this.averageRating;
    let percentage: number;

    if (rating >= 4.5) {
      // Diamante: barra llena
      percentage = 100;
    } else if (rating >= 3.5) {
      // Oro: avance entre 3.5 y 4.5
      percentage = ((rating - 3.5) / (4.5 - 3.5)) * 100;
    } else if (rating >= 2.5) {
      // Plata: avance entre 2.5 y 3.5
      percentage = ((rating - 2.5) / (3.5 - 2.5)) * 100;
    } else if (rating >= 1.0) {
      // Bronce: avance entre 1.0 y 2.5
      percentage = ((rating - 1.0) / (2.5 - 1.0)) * 100;
    } else {
      // Menos de 1.0: barra vacía
      percentage = 0;
    }
    // Limitar entre 0 y 100
    percentage = Math.max(0, Math.min(percentage, 100));
    return Number(percentage.toFixed(2));
  }

  getNextRankMessage(): string {
    const rating = this.averageRating;

    if (rating >= 4.5) {
      return '¡Felicidades! Has alcanzado el rango máximo';
    } else if (rating >= 3.5) {
      const needed = (4.5 - rating).toFixed(1);
      return `${needed} estrellas para alcanzar Diamante`;
    } else if (rating >= 2.5) {
      const needed = (3.5 - rating).toFixed(1);
      return `${needed} estrellas para alcanzar Oro`;
    } else {
      const needed = (2.5 - rating).toFixed(1);
      return `${needed} estrellas para alcanzar Plata`;
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
                this.loadUserGameCounts(res.data.user_id);
              } else {
                this.showNoUserMessage = true;
              }
            },
            error: (err) => {
              console.error(
                'No se pudo obtener el id del usuario por email',
                err
              );
              this.tryTokenRefresh();
            },
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
            this.loadUserGameCounts(res.user.Id); // Asegurar que también se cargue el conteo de juegos
          } else {
            this.showNoUserMessage = true;
          }
        },
        error: (err) => {
          console.error(
            'No se pudo refrescar el token ni obtener el id del usuario',
            err
          );
          this.showNoUserMessage = true;
        },
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
            const countryId = this.profileService.getCountryIdByName(
              this.user.country,
              this.countries
            );
            if (countryId) {
              this.user.country_id = countryId;
              console.log('Country ID asignado:', countryId);
            }
          } else if (!this.countriesLoaded) {
            // Si los países aún no están cargados, esperar un poco y reintentar
            setTimeout(() => {
              if (this.countriesLoaded && this.user && this.user.country) {
                const countryId = this.profileService.getCountryIdByName(
                  this.user.country,
                  this.countries
                );
                if (countryId) {
                  this.user.country_id = countryId;
                  console.log('Country ID asignado (reintento):', countryId);
                }
              }
            }, 200);
          }

          this.loadUserGameCounts(userId); // Cargar conteo de juegos del usuario
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

  private loadUserGameCounts(userId: number): void {
    this.gameTypeCountsService.getGameTypeCountsByUser(userId).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.gameTypeCounts = res.data;
          this.totalGamesCreated =
            (res.data.hangman_count || 0) +
            (res.data.memorygame_count || 0) +
            (res.data.puzzle_count || 0) +
            (res.data.solvetheword_count || 0);
        } else {
          this.gameTypeCounts = null;
          this.totalGamesCreated = 0;
        }
      },
      error: (err) => {
        console.error('Error al obtener conteo de juegos:', err);
        this.gameTypeCounts = null;
        this.totalGamesCreated = 0;
      },
    });
  }

  onUserUpdated(updatedUserData: any) {
    if (this.currentUserId) {
      console.log('Datos recibidos del modal:', updatedUserData);

      // Validar y formatear los datos antes de enviar
      const payload = {
        name: updatedUserData.name?.trim() || '',
        last_name: updatedUserData.last_name?.trim() || '',
        gender: updatedUserData.gender || 'Male', // Mantener el formato original (Male, Female, Other)
        birthdate: this.formatDateForAPI(updatedUserData.birthdate),
        city: updatedUserData.city?.trim() || '',
        country_id: Number(updatedUserData.country_id) || null,
      };

      console.log('Payload a enviar:', payload);

      // Validar que todos los campos requeridos estén presentes
      if (
        !payload.name ||
        !payload.last_name ||
        !payload.birthdate ||
        !payload.city ||
        !payload.country_id
      ) {
        console.error('Datos incompletos:', payload);
        this.alertService.showWarning(
          'Por favor, complete todos los campos requeridos'
        );
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
              this.alertService.showSuccess(
                'Perfil actualizado correctamente',
                '¡Éxito!'
              );
            }
          },
          error: (error) => {
            console.error('Error al actualizar perfil:', error);
            console.error('Error details:', error.error);
            if (error.status === 422) {
              this.alertService.showError(
                'Error de validación: Verifique que todos los campos estén correctos'
              );
            } else {
              this.alertService.showError(
                'Error al actualizar el perfil. Intente nuevamente.'
              );
            }
          },
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
          const countryId = this.profileService.getCountryIdByName(
            this.user.country,
            this.countries
          );
          if (countryId) {
            this.user.country_id = countryId;
          }
        }

        this.showModal = true;
      });
    } else {
      // Si los países ya están cargados, verificar que el usuario tenga country_id
      if (this.user && this.user.country && !this.user.country_id) {
        const countryId = this.profileService.getCountryIdByName(
          this.user.country,
          this.countries
        );
        if (countryId) {
          this.user.country_id = countryId;
          console.log('Country ID asignado en modal:', countryId);
        }
      }
      console.log('Usuario que se pasa al modal:', this.user);
      console.log('Países que se pasan al modal:', this.countries);
      this.showModal = true;
    }
  }

  cerrarModal() {
    this.showModal = false;
  }

  formatMemberSince(dateString: string | undefined): string {
    if (!dateString) return 'Fecha no disponible';

    try {
      // Si la fecha viene en formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss), parsearla sin zona horaria
      if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
        const [year, month, day] = dateString
          .split('T')[0]
          .split('-')
          .map(Number);
        const date = new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
        }
      }

      // Para otros formatos, usar el método tradicional
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }

      return 'Fecha no disponible';
    } catch (error) {
      console.error(
        'Error al formatear fecha:',
        error,
        'Fecha original:',
        dateString
      );
      return 'Fecha no disponible';
    }
  }
}
