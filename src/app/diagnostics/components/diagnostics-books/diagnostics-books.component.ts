import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom, forkJoin } from 'rxjs';
import { LoadBooksResourcesService } from '../../../books/services/load-books-resources.service';
import { LoadWordResourcesService } from '../../../shared/services/load-word-resources.service';
import { LoadVerbResourcesService } from '../../../shared/services/load-verb-resources.service';
import { TranslatorService } from '../../../shared/services/translator.service';

@Component({
  selector: 'app-diagnostics-books',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diagnostics-books.component.html',
  styleUrls: ['./diagnostics-books.component.scss'],
})
export class DiagnosticsBooksComponent implements OnInit {
  private loadBooks = inject(LoadBooksResourcesService);
  private loadWords = inject(LoadWordResourcesService);
  private loadVerbs = inject(LoadVerbResourcesService);
  private translator = inject(TranslatorService);

  loading = false;
  totalWords = 0;
  translated = 0;
  notTranslated = 0;
  uniqueNotTranslated = new Set<string>();
  notTranslatedList: string[] = [];
  Math = Math;

  ngOnInit(): void {
    this.runDiagnostics();
  }

  async runDiagnostics(): Promise<void> {
    this.loading = true;
    this.totalWords = this.translated = this.notTranslated = 0;
    this.uniqueNotTranslated.clear();
    this.notTranslatedList = [];

    const words = await firstValueFrom(this.loadWords.getWords(['words.json']));
    const verbGroups = await firstValueFrom(
      this.loadVerbs.getVerbGroups([
        'group-1.json',
        'group-2.json',
        'group-3.json',
        'group-4.json',
      ]),
    );

    this.translator.init(words, verbGroups);

    const books = await firstValueFrom(this.loadBooks.getBooks(['books.json']));

    const pageReqs = [] as ReturnType<
      LoadBooksResourcesService['loadBookPage']
    >[];
    for (const b of books) {
      for (let p = 1; p <= (b.content_length ?? 0); p++) {
        pageReqs.push(this.loadBooks.loadBookPage(b, p));
      }
    }

    if (pageReqs.length === 0) {
      this.loading = false;
      return;
    }

    const pages = await firstValueFrom(forkJoin(pageReqs));

    const wordRegex = /[\p{L}\p{M}’'-]+/gu;

    for (const text of pages) {
      if (!text) continue;
      const matches = Array.from(text.matchAll(wordRegex)).map((m) => m[0]);

      for (const raw of matches) {
        const word = raw.trim();
        if (!word) continue;
        this.totalWords++;

        const translated = this.translator.translateText(word);
        if (translated === word) {
          this.notTranslated++;
          this.uniqueNotTranslated.add(word);
        } else {
          this.translated++;
        }
      }
    }

    this.notTranslatedList = Array.from(this.uniqueNotTranslated).sort();
    this.loading = false;
  }

  get percentTranslated(): number {
    return this.totalWords
      ? Math.round((this.translated / this.totalWords) * 100)
      : 0;
  }

  get percentNotTranslated(): number {
    return 100 - this.percentTranslated;
  }
}
