import { inject, Injectable } from '@angular/core';
import { forkJoin, map, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Word } from '../models/word.model';

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
      map((words) => {
        const seen = new Set<string>();
        let flatWords = words.flatMap((word) => word);
        flatWords = flatWords.filter((word) => {
          const key = word.value || JSON.stringify(word);
          if (!seen.has(key)) {
            seen.add(key);
            word.translations ??= [];
            return true;
          }
          return false;
        });
        return flatWords;
      })
    );
  }
}
