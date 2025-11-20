import { inject, Injectable } from '@angular/core';
import { forkJoin, map, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Word } from '../models/words/word.model';
import { normalize } from '../helpers/string.helper';
import { CacheService } from './cache.service';

@Injectable({ providedIn: 'root' })
export class LoadWordResourcesService {
  http = inject(HttpClient);
  cache = inject(CacheService);

  getWords(files: string[]) {
    const reqs = files.map((file) =>
      this.cache.getOrSet(`words:${file}`, () =>
        this.http.get<Word[]>(file).pipe(take(1))
      )
    );

    return forkJoin(reqs).pipe(
      map((results) => {
        const flat = results.flat();
        const seen = new Set<string>();
        const unique: Word[] = [];

        for (const w of flat) {
          const key = w.value?.trim().toLowerCase();
          if (!key || seen.has(key)) continue;
          seen.add(key);
          w.translations ??= [];
          unique.push(w);
        }

        for (const w of unique) {
          w.similarWords = this.findSimilarWords(w, unique);
        }

        return unique;
      })
    );
  }

  private findSimilarWords(word: Word, all: Word[]): string[] {
    if (!word.translations?.length) return [];
    return all
      .filter(
        (o) =>
          o.value !== word.value &&
          o.translations.some((t) =>
            word.translations.some((wt) => normalize(t) === normalize(wt))
          )
      )
      .slice(0, 5)
      .map((w) => w.value);
  }
}
