import {CanDeactivateFn, Routes} from '@angular/router';
import {IDeactivatable} from './features/IDeactivatable';

export const canDeactivateForm: CanDeactivateFn<IDeactivatable | object> = (component) => {
  if(!('canDeactivate' in component)) return true;
  return component.canDeactivate();
};

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home.component').then(m => m.HomeComponent),
    canDeactivate: [canDeactivateForm]
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about.component').then(m => m.AboutComponent)
  }
];

