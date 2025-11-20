import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CacheService {
  private store = new Map<string, Observable<unknown>>();

  get<T>(key: string): Observable<T> | undefined {
    return this.store.get(key) as Observable<T> | undefined;
  }

  set<T>(key: string, source$: Observable<T>): Observable<T> {
    const cached = source$.pipe(shareReplay(1));
    this.store.set(key, cached);
    return cached;
  }

  getOrSet<T>(key: string, factory: () => Observable<T>): Observable<T> {
    const existing = this.get<T>(key);
    if (existing) return existing;
    return this.set<T>(key, factory());
  }
}
