import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, forkJoin, take } from 'rxjs';
import { environment } from '../environments/environment';
import { AddToPrefixPipe } from './pipes/add-to-prefix.pipe';

export interface VerbInformationSubgroup {
  subgroup: number;
  code: string;
  description: string;
  examples: string[];
}

export interface VerbInformationGroup {
  group: number;
  description: string;
  subgroups: VerbInformationSubgroup[];
}

type ConjugationKey = keyof Conjugations;

export interface VerbGroup {
  group: string;
  verbs: Verb[];
}

export interface Verb {
  infinitive: string;
  infinitive_translated?: string[];
  conjugations: Conjugations;
  type?: 'regular' | 'irregular';
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
  imports: [AddToPrefixPipe, CommonModule, FormsModule, ReactiveFormsModule],
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

  copiedText: string | null = null;
  copyTimeout: any;

  groupInformation: VerbInformationGroup[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const isProd = environment.production;

    const groupFiles = [
      { order: 1, file: isProd ? 'group-1.min.json' : 'group-1.json' },
      { order: 2, file: isProd ? 'group-2.min.json' : 'group-2.json' },
      { order: 3, file: isProd ? 'group-3.min.json' : 'group-3.json' },
      { order: 4, file: isProd ? 'group-4.min.json' : 'group-4.json' },
    ];

    const groupInformationFile = isProd
      ? 'group-information.min.json'
      : 'group-information.json';

    const requests = groupFiles.map((g) =>
      this.http.get<VerbGroup>(g.file).pipe(take(1))
    );

    forkJoin(requests).subscribe((groups) => {
      for (const group of groups) {
        for (const verb of group.verbs) {
          if (!verb.type) {
            verb.type = 'regular';
          }
        }
      }
      this.groupedVerbs = groups;
      this.filteredGroups = this.getRandomVerbsGroups(this.groupedVerbs, 15);
    });

    this.http
      .get<VerbInformationGroup[]>(groupInformationFile)
      .pipe(take(1))
      .subscribe((info) => {
        this.groupInformation = info;
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

  getGroupInfo(verb: any): VerbInformationGroup | undefined {
    return this.groupInformation.find((g) => g.group === verb.group);
  }

  getSubgroupInfo(verb: any): VerbInformationSubgroup | undefined {
    const group = this.getGroupInfo(verb);
    return group?.subgroups.find((sg) => sg.subgroup === verb.subgroup);
  }

  getConjugation(tense: string, person: string): string {
    const tenseSet =
      this.selectedVerb?.conjugations[tense as keyof Conjugations];
    if (!tenseSet) return '—';

    return (
      tenseSet[person as keyof ConjugationSet as keyof typeof tenseSet] || '—'
    );
  }

  copyToClipboard(value: string | null) {
    if (!value) return;

    navigator.clipboard.writeText(value).then(() => {
      this.copiedText = value;

      if (this.copyTimeout) clearTimeout(this.copyTimeout);

      this.copyTimeout = setTimeout(() => {
        this.copiedText = null;
      }, 1500);
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
    const selected = shuffled;
    return this.regroupVerbs(selected);
  }

  private limitVerbs(groups: VerbGroup[], maxCount: number): Verb[] {
    const all = groups.flatMap((g) => g.verbs);
    return all;

    // Flatten all verbs from filtered groups, limit by maxCount
    const count = maxCount === 0 ? 1 : maxCount;
    return all.slice(0, count);
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
