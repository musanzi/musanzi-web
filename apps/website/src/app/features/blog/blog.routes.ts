import { Routes } from '@angular/router';

export const blogRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        title: 'Blog',
        loadComponent: () => import('./pages/blog-list/blog-list').then((c) => c.BlogList)
      },
      {
        path: ':slug',
        title: 'Blog',
        loadComponent: () => import('./pages/blog-detail/blog-detail').then((c) => c.BlogDetail)
      }
    ]
  }
];
