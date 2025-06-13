import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent, LoginComponent } from './presentation';
import { JuegosComponent } from './presentation/features/juegos/juegos.component';
import { ProfileComponent } from './presentation/features/profile/profile.component';
import {GameHangmanComponent} from './presentation/features/hangman/game-hangman/game-hangman.component';
import {GamePuzzleComponent} from './presentation/features/Puzzle/game-puzzle/game-puzzle.component';
import {GameMemoryComponent} from './presentation/features/memory/game-memory/game-memory.component';
import {LayoutHangmanComponent} from './presentation/features/hangman/layout-hangman/layout-hangman.component';
import {LayoutsPuzzleComponent} from './presentation/features/Puzzle/layouts-puzzle/layouts-puzzle.component';
import {LayoutsMemoryComponent} from './presentation/features/memory/layouts-memory/layouts-memory.component';
import {
  LayoutsSolveTheWordComponent
} from './presentation/features/solveTheWord/layouts-solve-the-word/layouts-solve-the-word.component';
import { GameConfigurationComponent } from './presentation/shared/game-configuration/game-configuration.component';
import { ConfigGameComponent } from './presentation/features/config-game/config-game.component';
import { GameSolveTheWordComponent } from './presentation/features/solveTheWord/game-solve-the-word/game-solve-the-word.component';

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
        path: 'juegos/hangman',
        component: LayoutHangmanComponent,
      },
      {
        path: 'juegos/jugar-hangman/:id',
         component: GameHangmanComponent
      },




      {
        path: 'juegos/puzzle/jugar',
        component: GamePuzzleComponent
      },
      {
        path: 'juegos/puzzle/create',
        component: LayoutsPuzzleComponent
      },




      {
        path: 'juegos/memory/jugar',
        component: GameMemoryComponent
      },
      {
        path: 'juegos/memory/create',
        component: LayoutsMemoryComponent
      },




      {
        path: 'juegos/solve-The-Word/jugar',
        component: GamePuzzleComponent
      },
      {
        path: 'juegos/jugar-solve-the-word/:id',
        component: GameSolveTheWordComponent
      },
      {
        path: 'juegos/solve-The-Word/create',
        component: LayoutsSolveTheWordComponent
      },

      {
        path: 'juegos/editar/:id',
        component: GameConfigurationComponent
      },


      {
        path: 'juegos/configuracion/:id',
        component: ConfigGameComponent
      }
    ]
  }
];
