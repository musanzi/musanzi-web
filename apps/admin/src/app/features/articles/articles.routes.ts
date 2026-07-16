import { Routes } from '@angular/router';

export const articlesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        title: 'Articles',
        loadComponent: () => import('./pages/articles/articles').then((c) => c.Articles)
      },
      {
        path: 'new',
        title: 'Create article',
        loadComponent: () => import('./pages/article-form/article-form').then((c) => c.ArticleForm)
      },
      {
        path: ':id/edit',
        title: 'Edit article',
        loadComponent: () => import('./pages/article-form/article-form').then((c) => c.ArticleForm)
      }
    ]
  }
];
