import { Routes } from '@angular/router';
import { VocabularyComponent } from './words/components/vocabulary/vocabulary.component';
import { ConjugationComponent } from './verbs/components/conjugation/conjugation.component';

export const routes: Routes = [
  {
    path: 'conjugation',
    title: 'Verb Conjugation',
    component: ConjugationComponent,
  },
  {
    path: 'vocabulary',
    title: 'Vocabulary',
    component: VocabularyComponent,
  },
  { path: '**', redirectTo: 'conjugation', pathMatch: 'full' },
];
