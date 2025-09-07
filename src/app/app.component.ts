import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { debounceTime, distinctUntilChanged, forkJoin, take } from 'rxjs';
import { environment } from '../environments/environment';
import { AddToPrefixPipe } from './pipes/add-to-prefix.pipe';
import { GuessVerbsComponent } from './guess-verbs/guess-verbs.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';

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
  group: number;
  subgroup: number;
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
  imports: [
    AddToPrefixPipe,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GuessVerbsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  @ViewChild('searchInput') inputRef!: ElementRef<HTMLInputElement>;

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
  copyTimeout: ReturnType<typeof setTimeout> | null = null;

  groupInformation: VerbInformationGroup[] = [];

  isGamingMode = false;

  http = inject(HttpClient);

  releaseVersion = environment.releaseVersion;

  @HostListener('document:keydown.escape', ['$event'])
  onEscapePress(): void {
    if (!this.isGamingMode) {
      this.closePopup();
      this.inputRef.nativeElement.blur();
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'f') {
      event.preventDefault();

      if (this.selectedVerb || this.isGamingMode) {
        return;
      }

      this.inputRef.nativeElement.focus();
    } else if (event.ctrlKey && event.key === 'p') {
      event.preventDefault();

      if (this.selectedVerb || this.isGamingMode) {
        return;
      }

      this.activateGamingMode();
    }
  }

  ngOnInit(): void {
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

    forkJoin(requests).subscribe((groups: VerbGroup[]) => {
      for (const group of groups) {
        const seen = new Set<string>();
        group.verbs = group.verbs.filter((verb) => {
          const key = verb.infinitive || JSON.stringify(verb);
          if (!seen.has(key)) {
            seen.add(key);
            if (!verb.type) {
              verb.type = 'regular';
            }
            return true;
          }
          return false;
        });
      }
      this.groupedVerbs = groups;
      this.filteredGroups = this.getRandomVerbsGroups(this.groupedVerbs);
    });

    this.http
      .get<VerbInformationGroup[]>(groupInformationFile)
      .pipe(take(1))
      .subscribe((info: VerbInformationGroup[]) => {
        this.groupInformation = info;
      });

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((search: string | null) => {
        if (!search?.trim()) {
          this.filteredGroups = this.getRandomVerbsGroups(this.groupedVerbs);
          return;
        }

        const filtered = this.filterGroups(this.groupedVerbs, search);
        const limited = this.limitVerbs(filtered, 15);
        this.filteredGroups = this.regroupVerbs(limited);
      });
  }

  getOtherExamples(verb: Verb): string[] {
    const subgroup = this.getSubgroupInfo(verb);
    if (!subgroup || !subgroup.examples) return [];
    return subgroup.examples.filter(
      (ex) => !ex.includes(verb.infinitive) && !verb.infinitive.includes(ex)
    );
  }

  getGroupInfo(verb: Verb): VerbInformationGroup | undefined {
    return this.groupInformation.find((g) => g.group === verb.group);
  }

  getSubgroupInfo(verb: Verb | null): VerbInformationSubgroup | null {
    if (!verb) return null;

    const group = this.getGroupInfo(verb);
    return group?.subgroups.find((sg) => sg.subgroup === verb.subgroup) ?? null;
  }

  getConjugationAsString(tense: ConjugationKey, person: string): string {
    return this.getConjugation(
      tense,
      person as keyof ConjugationSet | keyof ImperativConjugation
    );
  }

  getConjugation(
    tense: ConjugationKey,
    person: keyof ConjugationSet | keyof ImperativConjugation
  ): string {
    const tenseSet = this.selectedVerb?.conjugations[tense];
    if (!tenseSet) return '—';

    return (
      tenseSet[person as keyof ConjugationSet as keyof typeof tenseSet] || '—'
    );
  }

  getSubgroupColorClass(verb: Verb): string {
    const subgroup = this.getSubgroupInfo(verb);
    if (!subgroup) return '';

    switch (subgroup.subgroup) {
      case 1:
        return 'group-green';
      case 2:
        return 'group-yellow';
      case 3:
        return 'group-orange';
      case 4:
        return 'group-red';
      case 5:
      default:
        return 'group-irregular';
    }
  }

  copyToClipboard(value: string | null): void {
    if (!value) return;

    navigator.clipboard.writeText(value).then(() => {
      this.copiedText = value;

      if (this.copyTimeout) clearTimeout(this.copyTimeout);

      this.copyTimeout = setTimeout(() => {
        this.copiedText = null;
      }, 1500);
    });
  }

  openPopup(verb: Verb): void {
    this.selectedVerb = verb;
  }

  closePopup(): void {
    this.selectedVerb = null;
    this.isGamingMode = false;
  }

  activateGamingMode(): void {
    this.isGamingMode = true;
  }

  private getRandomVerbsGroups(groups: VerbGroup[]): VerbGroup[] {
    const allVerbs = groups.flatMap((g) =>
      g.verbs.map((v) => ({ group: g.group, verb: v }))
    );
    const shuffled = [...allVerbs].sort(() => Math.random() - 0.5);
    const selected = shuffled;
    return this.regroupVerbs(selected);
  }

  private limitVerbs(groups: VerbGroup[], maxCount: number): Verb[] {
    if (maxCount > 500) {
      console.warn('maxCount too high, limiting to 500');
      maxCount = 500;
    }

    const all = groups.flatMap((g) => g.verbs);
    return all;
  }

  private regroupVerbs(
    items: { group: string; verb: Verb }[] | Verb[]
  ): VerbGroup[] {
    let pairs: { group: string; verb: Verb }[] = [];

    if (
      items.length &&
      typeof items[0] === 'object' &&
      'group' in items[0] &&
      'verb' in items[0]
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

    const map = new Map<string, Verb[]>();
    for (const { group, verb } of pairs) {
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(verb);
    }

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
      .replace(/[\u0300-\u036f]/g, '')
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
      const values =
        tenseKey !== 'imperativ'
          ? Object.values(conjugation as ConjugationSet)
          : Object.values(conjugation as ImperativConjugation);

      if (
        values.some((form) => this.normalizeText(form).includes(normSearch))
      ) {
        return true;
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
