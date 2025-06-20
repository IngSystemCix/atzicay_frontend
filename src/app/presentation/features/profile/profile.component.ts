import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalEditUsersComponent } from '../../shared/modal-edit-users/modal-edit-users.component';
import { UserService } from '../../../core/infrastructure/api/user.service';
import { CountriesService } from '../../../core/infrastructure/api/countries.service';
import { Country } from '../../../core/domain/interface/countries';
import { GameInstanceService } from '../../../core/infrastructure/api/GameInstance/game-instance.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalEditUsersComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  countries: Country[] = [];
  user: any = {}; // Objeto para almacenar los datos del usuario
  private currentUserId: number | null = null;
  picture: string = '';
  totalGamesCreated: number = 0;
  gameCounts: any = {}; 
  constructor(
    public auth: AuthService,
    private userService: UserService,
    private countriesService: CountriesService,
    private gameInstanceService: GameInstanceService 

  ) {
    this.loadCountries().then(() => {
      this.auth.user$.subscribe((auth0User) => {
        if (auth0User?.email) {
          // Guardar la foto de Auth0
          this.picture = auth0User.picture || 'assets/default-profile.png';

          this.userService
            .findUserByEmail(auth0User.email)
            .subscribe((response) => {
              if (response && response.data) {
                this.currentUserId = response.data.Id;
                this.loadUserProfile(response.data.Id);
              }
            });
        } else {
          // Si no hay usuario de Auth0, intentar obtener de sessionStorage
          const auth0UserRaw = sessionStorage.getItem('auth0_user');
          if (auth0UserRaw) {
            try {
              const storedAuth0User = JSON.parse(auth0UserRaw);
              this.picture =
                storedAuth0User.picture || 'assets/default-profile.png';
            } catch (e) {
              this.picture = 'assets/default-profile.png';
            }
          }
        }
      });
    });
  }

  private loadCountries(): Promise<void> {
    return new Promise((resolve) => {
      this.countriesService.getAllCountries().subscribe((data) => {
        this.countries = data;
        resolve();
      });
    });
  }

  private loadUserProfile(userId: number) {
    this.userService.getUserById(userId).subscribe((response) => {
      if (response && response.data) {
        const countryId = response.data.CountryId;

        const countryName =
          this.countries.find((c) => c.Id === countryId)?.Name ||
          'No especificado';

        this.user = {
          id: response.data.Id,
          name: response.data.Name,
          lastName: response.data.LastName,
          email: response.data.Email,
          gender: response.data.Gender,
          countryId: countryId,
          countryName: countryName,
          city: response.data.City,
          birthdate: response.data.Birthdate,
          created_at: this.formatDate(response.data.CreatedAt),
          activated: response.data.Activated,
          fullName: `${response.data.Name} ${response.data.LastName}`,
          formattedBirthdate: this.formatDate(response.data.Birthdate),
          picture: this.picture,
          games_created: 0
        };
         this.loadGameCounts(userId);
      }
    });
  }

  onUserUpdated(updatedUserData: any) {
    if (this.currentUserId) {
      // Preparar datos para el API
      const userDto = {
        Activated: updatedUserData.activated || true,
        Email: updatedUserData.email,
        Name: updatedUserData.name,
        LastName: updatedUserData.lastName,
        Gender: updatedUserData.gender,
        CountryId: updatedUserData.countryId,
        City: updatedUserData.city,
        Birthdate: updatedUserData.birthdate,
      };

      this.userService
        .updateUser(this.currentUserId, userDto)
        .subscribe((response) => {
          if (response && response.status === 'success') {
            // Recargar los datos del perfil
            this.loadUserProfile(this.currentUserId!);
            this.cerrarModal();
            // Opcional: mostrar mensaje de éxito
            console.log('Usuario actualizado correctamente');
          } else {
            console.error('Error al actualizar usuario');
          }
        });
    }
  }

  private loadGameCounts(userId: number) {
  this.gameInstanceService.getGameCountsByProfessor(userId).subscribe(
    (counts) => {
      this.gameCounts = counts;
      // Calcular el total sumando todos los valores
      this.totalGamesCreated = Object.values(counts).reduce((total: number, count: any) => total + count, 0);
      
      // Actualizar el objeto user con el total
      if (this.user) {
        this.user.games_created = this.totalGamesCreated;
      }
    },
    (error) => {
      console.error('Error al cargar conteos de juegos:', error);
      this.gameCounts = {};
      this.totalGamesCreated = 0;
    }
  );
}

  private formatDate(dateString: string): string {
    return dateString.split('T')[0];
  }

  showModal = false;

  abrirModal() {
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }
}
