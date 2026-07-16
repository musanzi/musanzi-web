import { Routes } from '@angular/router';
import { LandingLayout } from './layout/layout';

export const landingRoutes: Routes = [
  {
    path: '',
    component: LandingLayout,
    children: [
      {
        path: '',
        title: 'Home',
        loadComponent: () => import('./pages/home/home').then((c) => c.Home)
      }
    ]
  }
];
