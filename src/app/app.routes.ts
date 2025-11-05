import { Routes } from '@angular/router';
import { ConjugationComponent } from './verb-conjugation/components/conjugation/conjugation.component';

export const routes: Routes = [
  {
    path: 'conjugation',
    title: 'Verb Conjugation',
    component: ConjugationComponent,
  },
  { path: '**', redirectTo: 'conjugation', pathMatch: 'full' },
];
