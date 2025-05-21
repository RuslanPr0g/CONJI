import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';

type ConjugationKey = keyof Conjugations;

export interface VerbGroup {
  group: string;
  verbs: Verb[];
}

export interface Verb {
  infinitive: string;
  conjugations: Conjugations;
}

export interface Conjugations {
  prezent: ConjugationSet;
  perfect_compus: ConjugationSet;
  viitor_literar: ConjugationSet;
  viitor_familiar: ConjugationSet;
  conjunctiv: ConjugationSet;
  conditional: ConjugationSet;
  imperativ: ImperativConjugation;
}

export interface ConjugationSet {
  eu: string;
  tu: string;
  'el/ea': string;
  noi: string;
  voi: string;
  'ei/ele': string;
}

export interface ImperativConjugation {
  tu: string;
  voi: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  groupedVerbs: VerbGroup[] = [];
  searchText: string = '';
  title: string = 'CONJI APP';
  selectedVerb: Verb | null = null;
  conjugationKeys: ConjugationKey[] = [
    'prezent',
    'perfect_compus',
    'viitor_literar',
    'viitor_familiar',
    'conjunctiv',
    'conditional',
    'imperativ',
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http
      .get<VerbGroup[]>('verbs.json')
      .pipe(take(1))
      .subscribe((data) => {
        this.groupedVerbs = data;
      });
  }

  openPopup(verb: Verb) {
    this.selectedVerb = verb;
  }

  closePopup() {
    this.selectedVerb = null;
  }
}
