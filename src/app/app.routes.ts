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
import { ConfigGameComponent } from './presentation/features/config-game/config-game.component';
import { GameSolveTheWordComponent } from './presentation/features/solveTheWord/game-solve-the-word/game-solve-the-word.component';
import { authGuard } from './core/infrastructure/guards/auth.guard';
import { loginGuard } from './core/infrastructure/guards/login.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard],
    title: 'Login'
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: DashboardComponent,
        title:"Dashboard"
      }
    ]
  },
  {
    path: 'juegos',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: JuegosComponent,
        title: "Juegos"
      },
      {
        path: 'hangman',
        component: LayoutHangmanComponent,
        title:"Crear Ahorcado"
      },
      {
        path: 'jugar-hangman/:id',
        component: GameHangmanComponent,
        title:"Juego de ahorcado"
      },
      {
        path: 'puzzle/jugar',
        component: GamePuzzleComponent,
        title:"Juego de Rompezabezas"
      },
      {
        path: 'jugar-puzzle/:id',
        component: GamePuzzleComponent,
        title:"Juego de Rompezabezas"
      },
      {
        path: 'puzzle/create',
        component: LayoutsPuzzleComponent,
        title:"Crear Rompezabezas"
      },
      {
        path: 'memory/jugar',
        component: GameMemoryComponent,
        title:"Juego de Memoria"
      },
      {
        path: 'memory/create',
        component: LayoutsMemoryComponent,
        title:"Crear Memoria"
      },
      {
        path: 'solve-The-Word/jugar',
        component: GamePuzzleComponent,
        title:"Juego de Pupiletras"
      },
      {
        path: 'jugar-solve-the-word/:id',
        component: GameSolveTheWordComponent,
        title:"Juego de Pupiletras"
      },
      {
        path: 'solve-The-Word/create',
        component: LayoutsSolveTheWordComponent,
        title:"Crear Pupiletras"
      },
      {
        path: 'configuracion/:id',
        component: ConfigGameComponent,
        title: "Configuración del Juego"
      }
    ]
  },
  {
    path: 'perfil',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ProfileComponent,
        title: "Perfil"
      }
    ]
  }
];