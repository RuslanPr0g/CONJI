import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, forkJoin, take } from 'rxjs';

type ConjugationKey = keyof Conjugations;

export interface VerbGroup {
  group: string;
  verbs: Verb[];
}

export interface Verb {
  infinitive: string;
  infinitive_translated?: string[];
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  groupedVerbs: VerbGroup[] = [];
  filteredGroups: VerbGroup[] = [];
  searchControl = new FormControl('');
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
    const groupFiles = [
      { order: 1, file: 'group-1.json' },
      { order: 2, file: 'group-2.json' },
      { order: 3, file: 'group-3.json' },
      { order: 4, file: 'group-4.json' },
      { order: 5, file: 'group-5.json' },
    ];

    const requests = groupFiles.map((g) =>
      this.http.get<VerbGroup>(g.file).pipe(take(1))
    );

    forkJoin(requests).subscribe((groups) => {
      this.groupedVerbs = groups;
      this.filteredGroups = this.getRandomVerbsGroups(this.groupedVerbs, 15);
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((search) => {
        if (!search?.trim()) {
          this.filteredGroups = this.getRandomVerbsGroups(
            this.groupedVerbs,
            15
          );
          return;
        }

        const filtered = this.filterGroups(this.groupedVerbs, search);
        const limited = this.limitVerbs(filtered, 15);
        this.filteredGroups = this.regroupVerbs(limited);
      });
  }

  openPopup(verb: Verb) {
    this.selectedVerb = verb;
  }

  closePopup() {
    this.selectedVerb = null;
  }

  private getRandomVerbsGroups(
    groups: VerbGroup[],
    maxCount: number
  ): VerbGroup[] {
    // Flatten all verbs with group reference
    const allVerbs = groups.flatMap((g) =>
      g.verbs.map((v) => ({ group: g.group, verb: v }))
    );
    // Shuffle
    const shuffled = [...allVerbs].sort(() => Math.random() - 0.5);
    // Take up to maxCount
    const selected = shuffled.slice(0, maxCount);
    return this.regroupVerbs(selected);
  }

  private limitVerbs(groups: VerbGroup[], maxCount: number): Verb[] {
    // Flatten all verbs from filtered groups, limit by maxCount
    const all = groups.flatMap((g) => g.verbs);
    return all.slice(0, maxCount);
  }

  private regroupVerbs(
    items: { group: string; verb: Verb }[] | Verb[]
  ): VerbGroup[] {
    let pairs: { group: string; verb: Verb }[] = [];
    if (
      items.length &&
      'group' in (items[0] as any) &&
      'verb' in (items[0] as any)
    ) {
      pairs = items as { group: string; verb: Verb }[];
    } else {
      pairs = [];
      for (const verb of items as Verb[]) {
        for (const g of this.groupedVerbs) {
          if (g.verbs.includes(verb)) {
            pairs.push({ group: g.group, verb });
            break;
          }
        }
      }
    }

    // Group by group name
    const map = new Map<string, Verb[]>();
    for (const { group, verb } of pairs) {
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(verb);
    }

    // Preserve group order from groupedVerbs
    return this.groupedVerbs
      .filter((g) => map.has(g.group))
      .map((g) => ({
        group: g.group,
        verbs: map.get(g.group)!,
      }));
  }

  private normalizeText(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacritics (Ă -> A)
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  }

  private verbMatchesSearch(verb: Verb, search: string): boolean {
    const normSearch = this.normalizeText(search);
    if (
      this.normalizeText(verb.infinitive).includes(normSearch) ||
      (verb.infinitive_translated &&
        verb.infinitive_translated.some((t) =>
          this.normalizeText(t).includes(normSearch)
        ))
    ) {
      return true;
    }
    for (const tenseKey of this.conjugationKeys) {
      const conjugation = verb.conjugations[tenseKey];
      if (tenseKey !== 'imperativ') {
        for (const form of Object.values(conjugation as ConjugationSet)) {
          if (this.normalizeText(form).includes(normSearch)) return true;
        }
      } else {
        for (const form of Object.values(conjugation as ImperativConjugation)) {
          if (this.normalizeText(form).includes(normSearch)) return true;
        }
      }
    }
    return false;
  }

  private filterGroups(groups: VerbGroup[], search: string): VerbGroup[] {
    const normSearch = search.trim();
    if (!normSearch) return groups;

    return groups
      .map((group) => ({
        group: group.group,
        verbs: group.verbs.filter((verb) =>
          this.verbMatchesSearch(verb, normSearch)
        ),
      }))
      .filter((group) => group.verbs.length > 0);
  }
}
