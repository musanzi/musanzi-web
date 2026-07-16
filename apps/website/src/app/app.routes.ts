import { Route } from '@angular/router';
import { LandingLayout } from './features/landing/layout/layout';

export const routes: Route[] = [
  {
    path: '',
    component: LandingLayout,
    loadChildren: () => import('./features/landing/landing.routes').then((r) => r.landingRoutes)
  },
  {
    path: 'blog',
    component: LandingLayout,
    loadChildren: () => import('./features/blog/blog.routes').then((r) => r.blogRoutes)
  },
  { path: '**', redirectTo: '/' }
];
