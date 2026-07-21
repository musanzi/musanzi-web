import { INavigationItem } from '@libs/utils';

export const NAVIGATION: INavigationItem[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Overview',
    children: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        route: '/',
        icon: 'layout-dashboard'
      }
    ]
  },
  {
    id: 'content',
    label: 'Content',
    description: 'Publishing',
    children: [
      {
        id: 'projects',
        label: 'Projects',
        route: '/projects',
        icon: 'app-window',
        activeOptions: { exact: false }
      },
      {
        id: 'articles',
        label: 'Articles',
        route: '/articles',
        icon: 'newspaper',
        activeOptions: { exact: false }
      },
      {
        id: 'tags',
        label: 'Tags',
        route: '/tags',
        icon: 'tags'
      }
    ]
  },
  {
    id: 'access',
    label: 'Access',
    description: 'User management',
    children: [
      {
        id: 'roles',
        label: 'Roles',
        route: '/roles',
        icon: 'shield-check'
      },
      {
        id: 'users',
        label: 'Users',
        route: '/users',
        icon: 'users'
      }
    ]
  },
  {
    id: 'account',
    label: 'My account',
    description: 'Account management',
    children: [
      {
        id: 'account-profile',
        label: 'My account',
        route: '/account/profile',
        icon: 'user',
        activeOptions: { exact: true }
      },
      {
        id: 'account-security',
        label: 'Password',
        route: '/account/security',
        icon: 'lock-keyhole',
        activeOptions: { exact: true }
      }
    ]
  }
];
