import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent, LoginComponent } from './presentation';
import { JuegosComponent } from './presentation/features/juegos/juegos.component';
import { ProfileComponent } from './presentation/features/profile/profile.component';
import {CreateHangmanComponent} from './presentation/features/hangman/create-hangman/create-hangman.component';
import {GameHangmanComponent} from './presentation/features/hangman/game-hangman/game-hangman.component';
import {
  GameSolveTheWordComponent
} from './presentation/features/solveTheWord/game-solve-the-word/game-solve-the-word.component';

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
      },
      {
        path: 'juegos/jugar-hangman',
        component: GameHangmanComponent
      },
      {
        path: 'juegos/solve-the-word',
        component: GameSolveTheWordComponent
      }
    ]
  }
];
