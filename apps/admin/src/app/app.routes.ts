import { Route } from '@angular/router';
import { authGuard, lockedGuard } from './features/auth/data-access';

export const routes: Route[] = [
  {
    path: 'locked',
    canActivate: [lockedGuard],
    title: 'Restricted access',
    loadComponent: () => import('./features/locked/locked').then((c) => c.Locked)
  },
  {
    path: 'auth',
    title: 'Authentication',
    loadChildren: () => import('./features/auth/auth.routes').then((r) => r.authRoutes)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout').then((c) => c.AdminLayout),
    children: [
      {
        path: '',
        title: 'Stats',
        loadComponent: () => import('./features/stats/pages/stats/stats').then((c) => c.Stats)
      },
      {
        path: 'roles',
        title: 'Roles',
        loadComponent: () => import('./features/roles/pages/roles/roles').then((c) => c.Roles)
      },
      {
        path: 'users',
        title: 'Users',
        loadComponent: () => import('./features/users/pages/users/users').then((c) => c.Users)
      },
      {
        path: 'tags',
        title: 'Tags',
        loadComponent: () => import('./features/tags/pages/tags/tags').then((c) => c.Tags)
      },
      {
        path: 'projects',
        title: 'Projects',
        loadChildren: () => import('./features/projects/projects.routes').then((r) => r.projectsRoutes)
      },
      {
        path: 'account',
        title: 'Account',
        loadChildren: () => import('./features/account/account.routes').then((r) => r.accountRoutes)
      },
      {
        path: 'articles',
        title: 'Articles',
        loadChildren: () => import('./features/articles/articles.routes').then((r) => r.articlesRoutes)
      }
    ]
  },
  { path: '**', redirectTo: '/' }
];
