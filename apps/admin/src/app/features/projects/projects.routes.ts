import { Routes } from '@angular/router';

export const projectsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        title: 'Projects',
        loadComponent: () => import('./pages/projects/projects').then((c) => c.Projects)
      },
      {
        path: 'new',
        title: 'Create project',
        loadComponent: () => import('./pages/project-form/project-form').then((c) => c.ProjectForm)
      },
      {
        path: ':id/edit',
        title: 'Edit project',
        loadComponent: () => import('./pages/project-form/project-form').then((c) => c.ProjectForm)
      }
    ]
  }
];
