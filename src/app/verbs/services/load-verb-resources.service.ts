import { inject, Injectable } from '@angular/core';
import { VerbGroup } from '../models/verb-group.model';
import { forkJoin, map, Observable, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { VerbInformationGroup } from '../models/verb-information-group.model';

@Injectable({
  providedIn: 'root',
})
export class LoadVerbResourcesService {
  http = inject(HttpClient);

  getVerbGroups(files: string[]) {
    const requests = files.map((file) =>
      this.http.get<VerbGroup>(file).pipe(take(1))
    );

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

  getGroupInformation(file: string): Observable<VerbInformationGroup[]> {
    return this.http.get<VerbInformationGroup[]>(file).pipe(take(1));
  }
}
