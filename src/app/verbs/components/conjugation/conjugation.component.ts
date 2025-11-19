import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { AddToPrefixPipe } from '../../../shared/pipes/add-to-prefix.pipe';
import { LoadVerbResourcesService } from '../../../shared/services/load-verb-resources.service';
import { normalize } from '../../../shared/helpers/string.helper';
import {
  getGroupFileNames,
  getGroupInformationFileName,
} from '../../../shared/const/files.const';
import { ConjugationKey } from '../../../shared/models/verbs/conjugation-key.model';
import { ConjugationSet } from '../../../shared/models/verbs/conjugation-set.model';
import { ImperativConjugation } from '../../../shared/models/verbs/imperative-conjugation.model';
import { VerbGroup } from '../../../shared/models/verbs/verb-group.model';
import { VerbInformationGroup } from '../../../shared/models/verbs/verb-information-group.model';
import { VerbInformationSubgroup } from '../../../shared/models/verbs/verb-information-subgroup.model';
import { Verb } from '../../../shared/models/verbs/verb.model';
import { GuessVerbsComponent } from '../guess-verbs/guess-verbs.component';

@Component({
  selector: 'app-conjugation',
  standalone: true,
  imports: [
    AddToPrefixPipe,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GuessVerbsComponent,
  ],
  templateUrl: './conjugation.component.html',
  styleUrl: './conjugation.component.scss',
})
export class ConjugationComponent implements OnInit {
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

  loadVerbsService = inject(LoadVerbResourcesService);

  @HostListener('document:keydown.escape')
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

    this.loadVerbsService
      .getVerbGroups(getGroupFileNames(isProd).map((f) => f.file))
      .subscribe((groups: VerbGroup[]) => {
        this.groupedVerbs = groups;
        this.filteredGroups = this.getRandomVerbsGroups(this.groupedVerbs);
      });

    this.loadVerbsService
      .getGroupInformation(getGroupInformationFileName(isProd))
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
    if (!Array.isArray(this.groupInformation)) {
      return undefined;
    }

    return this.groupInformation.find((g) => g.group === verb.group);
  }

  getSubgroupInfo(verb: Verb | null): VerbInformationSubgroup | null {
    if (!verb) return null;

    const group = this.getGroupInfo(verb);
    return (
      group?.subgroups?.find((sg) => sg.subgroup === verb.subgroup) ?? null
    );
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
    if (this.filteredGroups.length > 0) {
      this.isGamingMode = true;
    }
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

  private verbMatchesSearch(verb: Verb, search: string): boolean {
    const normSearch = normalize(search);
    if (
      normalize(verb.infinitive).includes(normSearch) ||
      (verb.infinitive_translated &&
        verb.infinitive_translated.some((t) =>
          normalize(t).includes(normSearch)
        ))
    ) {
      return true;
    }

    for (const tenseKey of this.conjugationKeys) {
      const conjugation = verb.conjugations[tenseKey];

      if (!conjugation) {
        continue;
      }

      const values =
        tenseKey !== 'imperativ'
          ? Object.values(conjugation as ConjugationSet)
          : Object.values(conjugation as ImperativConjugation);

      if (values.some((form) => normalize(form).includes(normSearch))) {
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
