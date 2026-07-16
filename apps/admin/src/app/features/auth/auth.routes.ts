import { Routes } from '@angular/router';
import { unauthGuard } from './data-access';

export const authRoutes: Routes = [
  {
    path: '',
    canActivate: [unauthGuard],
    title: 'Authentication',
    loadComponent: () => import('./layout/layout').then((c) => c.AuthLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'sign-in'
      },
      {
        path: 'forgot-password',
        title: 'Forgot password',
        loadComponent: () => import('./pages/forgot-password/forgot-password').then((c) => c.AuthForgotPassword)
      },
      {
        path: 'forgot-password/sent',
        title: 'Link sent',
        loadComponent: () =>
          import('./pages/forgot-password-sent/forgot-password-sent').then((c) => c.AuthForgotPasswordSent)
      },
      {
        path: 'reset-password',
        title: 'Reset password',
        loadComponent: () => import('./pages/reset-password/reset-password').then((c) => c.AuthResetPassword)
      },
      {
        path: 'sign-in',
        title: 'Sign in',
        loadComponent: () => import('./pages/sign-in/sign-in').then((c) => c.AuthSignIn)
      }
    ]
  }
];
