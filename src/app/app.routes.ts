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
import { optimizedAuthGuard } from './core/infrastructure/guards/optimized-auth.guard';
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
    canActivate: [optimizedAuthGuard],
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
    canActivate: [optimizedAuthGuard],
    children: [
      {
        path: '',
        component: JuegosComponent,
        title: "Juegos"
      },
      {
        path: 'hangman',
        component: LayoutHangmanComponent,
        title: "Crear Ahorcado"
      },
      {
        path: 'puzzle/create',
        component: LayoutsPuzzleComponent,
        title: "Crear Rompezabezas"
      },
      {
        path: 'memory/create',
        component: LayoutsMemoryComponent,
        title: "Crear Memoria"
      },
      {
        path: 'solve-The-Word/create',
        component: LayoutsSolveTheWordComponent,
        title: "Crear Pupiletras"
      },
      {
        path: 'configuracion/:id',
        component: ConfigGameComponent,
        title: "Configuración del Juego"
      }
    ]
  },

  
  {
    path: 'juegos/jugar-hangman/:id',
    component: GameHangmanComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de ahorcado"
  },
  {
    path: 'game/hangman/:id',
    component: GameHangmanComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de ahorcado"
  },
  {
    path: 'juegos/jugar-puzzle/:id',
    component: GamePuzzleComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de Rompezabezas"
  },
  {
    path: 'game/puzzle/:id',
    component: GamePuzzleComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de Rompezabezas"
  },
  {
    path: 'juegos/puzzle/jugar',
    component: GamePuzzleComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de Rompezabezas"
  },
  {
    path: 'juegos/memory/jugar',
    component: GameMemoryComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de Memoria"
  },
  {
    path: 'game/memory/:id',
    component: GameMemoryComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de Memoria"
  },
  {
    path: 'juegos/jugar-solve-the-word/:id',
    component: GameSolveTheWordComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de Pupiletras"
  },
  {
    path: 'game/solve-the-word/:id',
    component: GameSolveTheWordComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de Pupiletras"
  },
  {
    path: 'juegos/solve-The-Word/jugar',
    component: GamePuzzleComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de Pupiletras"
  },
  {
    path: 'perfil',
    component: MainLayoutComponent,
    canActivate: [optimizedAuthGuard],
    children: [
      {
        path: '',
        component: ProfileComponent,
        title: "Perfil"
      }
    ]
  }
];