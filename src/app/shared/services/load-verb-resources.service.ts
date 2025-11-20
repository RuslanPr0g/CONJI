import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { VerbGroup } from '../models/verbs/verb-group.model';
import { VerbInformationGroup } from '../models/verbs/verb-information-group.model';
import { CacheService } from './cache.service';

@Injectable({ providedIn: 'root' })
export class LoadVerbResourcesService {
  http = inject(HttpClient);
  cache = inject(CacheService);

  getVerbGroups(files: string[]) {
    const reqs = files.map((file) =>
      this.cache.getOrSet(`verbGroup:${file}`, () =>
        this.http.get<VerbGroup>(file).pipe(take(1))
      )
    );

    return forkJoin(reqs).pipe(
      map((groups) =>
        groups.map((group) => {
          const seen = new Set<string>();
          group.verbs = group.verbs.filter((verb) => {
            const key = verb.infinitive || JSON.stringify(verb);
            if (!seen.has(key)) {
              seen.add(key);
              verb.type ??= 'regular';
              return true;
            }
            return false;
          });
          return group;
        })
      )
    );
  }

  getGroupInformation(file: string): Observable<VerbInformationGroup[]> {
    return this.cache.getOrSet(`verbInfo:${file}`, () =>
      this.http.get<VerbInformationGroup[]>(file).pipe(take(1))
    );
  }
}
