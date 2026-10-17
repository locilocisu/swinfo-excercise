import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/character-datapad/character-datapad').then((m) => m.CharacterDatapad),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
