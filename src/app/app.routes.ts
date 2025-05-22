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
import {GamePuzzleComponent} from './presentation/features/Puzzle/game-puzzle/game-puzzle.component';
import {CreatePuzzleComponent} from './presentation/features/Puzzle/create-puzzle/create-puzzle.component';
import {
  ConfigurationPuzzleComponent
} from './presentation/features/Puzzle/configuration-puzzle/configuration-puzzle.component';
import {
  CreateSolveTheWordComponent
} from './presentation/features/solveTheWord/create-solve-the-word/create-solve-the-word.component';
import {
  ConfigurationSolveTheWordComponent
} from './presentation/features/solveTheWord/configuration-solve-the-word/configuration-solve-the-word.component';
import {
  PreViewSolveTheWordComponent
} from './presentation/features/solveTheWord/pre-view-solve-the-word/pre-view-solve-the-word.component';
import {
  ConfigurationHangmanComponent
} from './presentation/features/hangman/configuration-hangman/configuration-hangman.component';
import {PreViewHangmanComponent} from './presentation/features/hangman/pre-view-hangman/pre-view-hangman.component';
import {MemoryGame} from './core/domain/model/memoryGame/memory-game';
import {GameMemoryComponent} from './presentation/features/memory/game-memory/game-memory.component';
import {PreViewMemoryComponent} from './presentation/features/memory/pre-view-memory/pre-view-memory.component';
import {
  ConfigurationMemoryComponent
} from './presentation/features/memory/configuration-memory/configuration-memory.component';
import {CreateMemoryComponent} from './presentation/features/memory/create-memory/create-memory.component';
import {LayoutHangmanComponent} from './presentation/features/hangman/layout-hangman/layout-hangman.component';

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



      // app.routes.ts o donde tengas tus rutas
      {
        path: 'juegos/hangman',
        component: LayoutHangmanComponent,
        children: [
          { path: 'content', component: CreateHangmanComponent },
          { path: 'config', component: ConfigurationHangmanComponent },
          { path: 'preview', component: PreViewHangmanComponent },
          { path: 'jugar', component: GameHangmanComponent },
          { path: '', redirectTo: 'content', pathMatch: 'full' }
        ]
      }
      ,



      {
        path: 'juegos/solve-the-word',
        children: [
          {
            path: 'jugar',
            component: GameSolveTheWordComponent
          },
          {
            path: 'create',
            component: CreateSolveTheWordComponent
          },
          {
            path: 'configuration',
            component: ConfigurationSolveTheWordComponent
          },
          {
            path: 'view',
            component: PreViewSolveTheWordComponent
          }
        ]
      },


      {
        path: 'juegos/puzzle',
        children: [
          {
            path: 'jugar',
            component: GamePuzzleComponent
          },
          {
            path: 'create',
            component: CreatePuzzleComponent
          },
          {
            path: 'configuration',
            component: ConfigurationPuzzleComponent
          },
          {
            path: 'view',
            component: GamePuzzleComponent
          }
        ]
      },


      {
        path: 'juegos/memory',
        children: [
          {
            path: '',
            redirectTo: 'jugar',
            pathMatch: 'full'
          },
          {
            path: 'jugar',
            component: GameMemoryComponent
          },
          {
            path: 'view',
            component: PreViewMemoryComponent
          },
          {
            path: 'configuration',
            component: ConfigurationMemoryComponent
          },
          {
            path: 'create',
            component: CreateMemoryComponent
          }
        ]
      },
    ]
  }
];
