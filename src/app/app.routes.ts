import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./presentation/features/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./presentation/features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

    ]
  }
];
