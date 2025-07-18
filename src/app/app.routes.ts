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
import { GameReportComponent } from './presentation/shared/my-games/game-report/game-report.component';
import { optimizedAuthGuard } from './core/infrastructure/guards/optimized-auth.guard';
import { loginGuard } from './core/infrastructure/guards/login.guard';
import { HangmanGameComponent } from './presentation/features/hangman/game-hangman/layouts/hangman-game/hangman-game.component';
import { HangmanProgrammingComponent } from './presentation/features/hangman/game-hangman/layouts/hangman-programming/hangman-programming.component';
import { SolveTheWordGameComponent } from './presentation/features/solveTheWord/game-solve-the-word/layouts/solve-the-word-game/solve-the-word-game.component';
import { SolveTheWordProgrammingComponent } from './presentation/features/solveTheWord/game-solve-the-word/layouts/solve-the-word-programming/solve-the-word-programming.component';
import { PuzzleGameComponent } from './presentation/features/Puzzle/game-puzzle/layouts/puzzle-game/puzzle-game.component';
import { PuzzleProgrammingComponent } from './presentation/features/Puzzle/game-puzzle/layouts/puzzle-programming/puzzle-programming.component';
import { MemoryGameComponent } from './presentation/features/memory/game-memory/layouts/memory-game/memory-game.component';
import { MemoryProgrammingComponent } from './presentation/features/memory/game-memory/layouts/memory-programming/memory-programming.component';

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
        title:"Inicio"
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
      },
      {
        path: 'reporte/:gameInstanceId',
        component: GameReportComponent,
        title: "Reporte del Juego"
      }
    ]
  },

  // Hangman
  {
    path: 'juegos/jugar-hangman/:id',
    component: HangmanGameComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de ahorcado"
  },
  {
    path: 'game/hangman/:id',
    component: HangmanGameComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de ahorcado"
  },
  {
    path: 'play/hangman/:token',
    component: HangmanProgrammingComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de ahorcado programado"
  },
  // Puzzle
  {
    path: 'juegos/jugar-puzzle/:id',
    component: PuzzleGameComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de Rompezabezas"
  },
  {
    path: 'game/puzzle/:id',
    component: PuzzleGameComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de Rompezabezas"
  },
  {
    path: 'play/puzzle/:token',
    component: PuzzleProgrammingComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de Rompezabezas programado"
  },
  // Memory
  {
    path: 'juegos/jugar-memory/:id',
    component: MemoryGameComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de Memoria"
  },
  {
    path: 'game/memory/:id',
    component: MemoryGameComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de Memoria"
  },
  {
    path: 'play/memory/:token',
    component: MemoryProgrammingComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de Memoria programado"
  },
  // Solve the Word
  {
    path: 'juegos/jugar-solve-the-word/:id',
    component: SolveTheWordGameComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de Pupiletras"
  },
  {
    path: 'game/solve-the-word/:id',
    component: SolveTheWordGameComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de Pupiletras"
  },
  {
    path: 'play/solve-the-word/:token',
    component: SolveTheWordProgrammingComponent,
    canActivate: [optimizedAuthGuard],
    title: "Juego de Pupiletras programado"
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
  },
];