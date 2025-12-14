import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./components/home/home').then(m => m.Home)
  },
  {
    path: 'categories',
    loadComponent: () => import('./components/category-list/category-list').then(m => m.CategoryList)
  },
  {
    path: 'about',
    loadComponent: () => import('./components/about/about').then(m => m.About)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then(m => m.Register)
  },
  {
    path: 'change-password',
    loadComponent: () => import('./components/change-password/change-password').then(m => m.ChangePassword)
  },
  {
    path: 'post/:slug',
    loadComponent: () => import('./components/post-detail/post-detail').then(m => m.PostDetail)
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  }
];