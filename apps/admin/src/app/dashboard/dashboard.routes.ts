import { Route } from '@angular/router';

export const dashboardRoutes: Route[] = [
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
    path: 'articles',
    title: 'Articles',
    loadComponent: () => import('./features/articles/pages/articles/articles').then((c) => c.Articles)
  },
  {
    path: 'articles/new',
    title: 'Create article',
    loadComponent: () => import('./features/articles/pages/article-form/article-form').then((c) => c.ArticleForm)
  },
  {
    path: 'articles/:id/edit',
    title: 'Edit article',
    loadComponent: () => import('./features/articles/pages/article-form/article-form').then((c) => c.ArticleForm)
  },
  {
    path: 'projects',
    title: 'Projects',
    loadComponent: () => import('./features/projects/pages/projects/projects').then((c) => c.Projects)
  },
  {
    path: 'projects/new',
    title: 'Create project',
    loadComponent: () => import('./features/projects/pages/project-form/project-form').then((c) => c.ProjectForm)
  },
  {
    path: 'projects/:id/edit',
    title: 'Edit project',
    loadComponent: () => import('./features/projects/pages/project-form/project-form').then((c) => c.ProjectForm)
  },
  {
    path: 'account',
    title: 'Account',
    loadChildren: () => import('./features/account/account.routes').then((r) => r.accountRoutes)
  }
];
