import { Injectable } from '@angular/core';
import { VerbGroup } from '../models/verb-group.model';
import { forkJoin, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadResourcesService {
  getVerbGroups(requests: Observable<VerbGroup>[]) {
    return forkJoin(requests).pipe(
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
}
