import { inject, Injectable } from '@angular/core';
import { forkJoin, map, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Word } from '../models/words/word.model';
import { CacheService } from './cache.service';

@Injectable({ providedIn: 'root' })
export class LoadWordResourcesService {
  http = inject(HttpClient);
  cache = inject(CacheService);

  getWords(files: string[]) {
    const reqs = files.map((file) =>
      this.cache.getOrSet(`words:${file}`, () =>
        this.http.get<Word[]>(file).pipe(take(1)),
      ),
    );

    return forkJoin(reqs).pipe(
      map((results) => {
        return results.flat();
      }),
    );
  }
}
