import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./pages/tabs/tabs.routes').then(m => m.tabsRoutes),
    canActivate: [authGuard]
  },
  {
    path: 'transaction-form',
    loadComponent: () => import('./pages/transaction-form/transaction-form.page').then(m => m.TransactionFormPage),
    canActivate: [authGuard]
  },
  {
    path: 'transaction-form/:id',
    loadComponent: () => import('./pages/transaction-form/transaction-form.page').then(m => m.TransactionFormPage),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

