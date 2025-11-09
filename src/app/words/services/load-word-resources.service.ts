import { inject, Injectable } from '@angular/core';
import { forkJoin, map, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Word } from '../models/word.model';
import { normalize } from '../../shared/helpers/string.helper';

@Injectable({
  providedIn: 'root',
})
export class LoadWordResourcesService {
  http = inject(HttpClient);

  getWords(files: string[]) {
    const requests = files.map((file) =>
      this.http.get<Word[]>(file).pipe(take(1))
    );

    return forkJoin(requests).pipe(
      map((results) => {
        const flatWords = results.flat();
        const seen = new Set<string>();
        const uniqueWords: Word[] = [];

        for (const word of flatWords) {
          const key = word.value?.trim().toLowerCase();
          if (!key || seen.has(key)) continue;

          seen.add(key);
          word.translations ??= [];
          uniqueWords.push(word);
        }

        for (const word of uniqueWords) {
          word.similarWords = this.findSimilarWords(word, uniqueWords);
        }

        return uniqueWords;
      })
    );
  }

  private findSimilarWords(word: Word, allWords: Word[]): string[] {
    if (!word.translations?.length) return [];

    const related = allWords
      .filter((other) => {
        if (other.value === word.value) return false;
        return other.translations.some((t) =>
          word.translations.some((wt) => normalize(t) === normalize(wt))
        );
      })
      .slice(0, 5)
      .map((w) => w.value);

    return related;
  }
}
