import { inject, Injectable } from '@angular/core';
import { Observable, of, tap, shareReplay } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CacheService {
  private store = new Map<string, Observable<unknown>>();
  private version = environment.releaseVersion;
  private VERSION_KEY = '__conji__cache_version__';
  private PREFIX = '__conji__cache__';

  private localStorageService = inject(LocalStorageService);

  constructor() {
    this.initializeVersion();
  }

  get isDevMode(): boolean {
    return this.version === 'dev';
  }

  get<T>(key: string): Observable<T> | undefined {
    const memory = this.store.get(key);
    if (memory) return memory as Observable<T>;

    if (this.isDevMode) return undefined;

    const stored = this.localStorageService.get(this.buildKey(key));
    if (!stored) return undefined;

    try {
      const parsed = JSON.parse(stored) as T;
      const observable$ = of(parsed).pipe(shareReplay(1));
      this.store.set(key, observable$);
      return observable$;
    } catch {
      return undefined;
    }
  }

  set<T>(key: string, source$: Observable<T>): Observable<T> {
    const cached$ = source$.pipe(
      tap((value) => {
        if (!this.isDevMode) {
          this.localStorageService.set(
            this.buildKey(key),
            JSON.stringify(value),
          );
        }
      }),
      shareReplay(1),
    );

    this.store.set(key, cached$);
    return cached$;
  }

  getOrSet<T>(key: string, factory: () => Observable<T>): Observable<T> {
    const existing = this.get<T>(key);
    if (existing) return existing;
    return this.set<T>(key, factory());
  }

  clearMemory(): void {
    this.store.clear();
  }

  clearAll(): void {
    this.store.clear();
    if (!this.isDevMode) {
      this.clearVersionedCache();
      this.localStorageService.set(this.VERSION_KEY, this.version);
    }
  }

  private initializeVersion(): void {
    if (this.isDevMode) return;

    const storedVersion = this.localStorageService.get(this.VERSION_KEY);

    if (storedVersion !== this.version) {
      this.clearVersionedCache();
      this.localStorageService.set(this.VERSION_KEY, this.version);
    }
  }

  private clearVersionedCache(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(this.PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  }

  private buildKey(key: string): string {
    return `${this.PREFIX}_${key}`;
  }
}
