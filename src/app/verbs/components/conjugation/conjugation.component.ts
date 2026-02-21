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
import { AddPrefixPipe } from '../../../shared/pipes/add-prefix/add-prefix.pipe';
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
    AddPrefixPipe,
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

  selectedGroup: string | null = null;
  loadedCount: Map<string, number> = new Map<string, number>();

  isSearching = false;
  availableGroups: string[] = [];

  loadVerbsService = inject(LoadVerbResourcesService);

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (!this.isGamingMode) {
      this.closePopup();
      this.inputRef?.nativeElement?.blur();
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'f') {
      event.preventDefault();

      if (this.selectedVerb || this.isGamingMode) {
        return;
      }

      this.inputRef?.nativeElement?.focus();
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
        this.availableGroups = groups.map((g) => g.group);
        for (const g of groups) {
          this.loadedCount.set(g.group, 5);
        }
        this.selectedGroup = this.groupedVerbs[0].group;
        this.updateFilteredGroups();
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
          this.isSearching = false;
          this.availableGroups = this.groupedVerbs.map((g) => g.group);
          this.updateFilteredGroups();
          return;
        }

        this.isSearching = true;
        const filtered = this.filterGroups(this.groupedVerbs, search);
        this.availableGroups = filtered.map((g) => g.group);
        if (!this.availableGroups.includes(this.selectedGroup!)) {
          this.selectedGroup = this.availableGroups[0] || null;
        }
        if (this.selectedGroup) {
          this.filteredGroups = filtered.filter(
            (g) => g.group === this.selectedGroup,
          );
        } else {
          this.filteredGroups = [];
        }
        for (const g of this.filteredGroups) {
          this.loadedCount.set(g.group, g.verbs.length);
        }
      });
  }

  getOtherExamples(verb: Verb): string[] {
    const subgroup = this.getSubgroupInfo(verb);
    if (!subgroup || !subgroup.examples) return [];
    return subgroup.examples.filter(
      (ex) => !ex.includes(verb.infinitive) && !verb.infinitive.includes(ex),
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
      person as keyof ConjugationSet | keyof ImperativConjugation,
    );
  }

  getConjugation(
    tense: ConjugationKey,
    person: keyof ConjugationSet | keyof ImperativConjugation,
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

  selectGroup(group: string): void {
    if (this.isSearching && this.selectedGroup === group) {
      return;
    }

    this.selectedGroup = group;
    if (this.isSearching) {
      const search = this.searchControl.value;
      const filtered = this.filterGroups(this.groupedVerbs, search!);
      this.filteredGroups = filtered.filter(
        (g) => g.group === this.selectedGroup,
      );
      for (const g of this.filteredGroups) {
        this.loadedCount.set(g.group, g.verbs.length);
      }
    } else {
      this.updateFilteredGroups();
    }
  }

  loadMore(group: string): void {
    const current = this.loadedCount.get(group) || 0;
    this.loadedCount.set(group, current + 25);
  }

  getDisplayedVerbs(group: VerbGroup): Verb[] {
    const count = this.loadedCount.get(group.group) || 0;
    return group.verbs.slice(0, count);
  }

  updateFilteredGroups(): void {
    if (this.selectedGroup === 'all') {
      this.filteredGroups = this.groupedVerbs;
    } else {
      this.filteredGroups = this.groupedVerbs.filter(
        (g) => g.group === this.selectedGroup,
      );
    }
    for (const g of this.groupedVerbs) {
      this.loadedCount.set(g.group, 25);
    }
  }

  private verbMatchesSearch(verb: Verb, search: string): boolean {
    const normSearch = normalize(search);
    if (
      normalize(verb.infinitive).includes(normSearch) ||
      (verb.infinitive_translated &&
        verb.infinitive_translated.some((t) =>
          normalize(t).includes(normSearch),
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
          this.verbMatchesSearch(verb, normSearch),
        ),
      }))
      .filter((group) => group.verbs.length > 0);
  }
}
