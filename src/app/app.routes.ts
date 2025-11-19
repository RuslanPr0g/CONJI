import { Routes } from '@angular/router';
import { VocabularyComponent } from './words/components/vocabulary/vocabulary.component';
import { ConjugationComponent } from './verbs/components/conjugation/conjugation.component';
import { ListBooksComponent } from './books/components/list-books/list-books.component';
import { ReadBookComponent } from './books/components/read-book/read-book.component';

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
  {
    path: 'books',
    title: 'Books',
    component: ListBooksComponent,
  },
  {
    path: 'read-book/:id',
    title: 'Read Book',
    component: ReadBookComponent,
  },
  { path: '**', redirectTo: 'conjugation', pathMatch: 'full' },
];
