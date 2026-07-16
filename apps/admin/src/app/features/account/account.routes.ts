import { Routes } from '@angular/router';

export const accountRoutes: Routes = [
  {
    path: '',
    title: 'Account',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'profile'
      },
      {
        path: 'profile',
        title: 'Profile',
        loadComponent: () => import('./pages/profile/profile').then((c) => c.AccountProfile)
      },
      {
        path: 'security',
        title: 'Security',
        loadComponent: () => import('./pages/security/security').then((c) => c.AccountSecurity)
      }
    ]
  }
];
