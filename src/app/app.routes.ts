import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent, LoginComponent } from './presentation';
import { JuegosComponent } from './presentation/features/juegos/juegos.component';
import { ProfileComponent } from './presentation/features/profile/profile.component';
import {CreateHangmanComponent} from './presentation/features/hangman/create-hangman/create-hangman.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'juegos',
        component: JuegosComponent
      },
      {
        path: 'perfil',
        component: ProfileComponent
      },
      {
        path: 'juegos/create-hangman',
        component: CreateHangmanComponent
      }
    ]
  }
];
