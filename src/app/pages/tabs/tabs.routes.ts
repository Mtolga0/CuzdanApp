import { Routes } from '@angular/router';

export const tabsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('../dashboard/dashboard.page').then(m => m.DashboardPage)
      },
      {
        path: 'transactions',
        loadComponent: () => import('../transactions/transactions.page').then(m => m.TransactionsPage)
      },
      {
        path: 'recurring',
        loadComponent: () => import('../recurring/recurring.page').then(m => m.RecurringPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('../profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
