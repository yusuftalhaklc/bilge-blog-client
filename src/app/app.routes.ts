import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'categories',
    loadComponent: () => import('./components/category-list/category-list').then(m => m.CategoryList)
  },
  {
    path: '',
    redirectTo: '/categories',
    pathMatch: 'full'
  }
];