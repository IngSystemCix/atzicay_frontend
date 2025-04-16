import { Routes } from '@angular/router';
import { LoginComponent } from './presentation';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'login', component: LoginComponent},
];
