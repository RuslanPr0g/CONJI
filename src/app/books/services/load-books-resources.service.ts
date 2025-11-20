import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, map, Observable, take, tap } from 'rxjs';
import { Book } from '../models/book.model';
import { CacheService } from '../../shared/services/cache.service';

@Injectable({ providedIn: 'root' })
export class LoadBooksResourcesService {
  http = inject(HttpClient);
  cache = inject(CacheService);

  getBooks(files: string[]) {
    const reqs = files.map((file) =>
      this.cache.getOrSet(`books:${file}`, () =>
        this.http.get<Book[]>(file).pipe(take(1))
      )
    );

    return combineLatest(reqs).pipe(
      map((x) => x.flat()),
      map((books) => {
        const seen = new Set<string>();
        return books.filter((b) => {
          const k = b.title?.trim().toLowerCase();
          if (!k || seen.has(k)) return false;
          seen.add(k);
          return true;
        });
      })
    );
  }

  loadBookPage(book: Book, page: number): Observable<string> {
    if (!book.id) {
      throw new Error('Book must have an id!');
    }

    if (page < 1 || page > book.content_length) {
      throw new Error(
        `Page number must be between 1 and ${book.content_length}!`
      );
    }

    const key = `book:${book.id}:page:${page}`;

    return this.cache
      .getOrSet(key, () =>
        this.http.get(`book-contents/${book.id}/${page}.html`, {
          responseType: 'text',
        })
      )
      .pipe(
        tap(() => {
          const next = page + 1;
          if (next <= book.content_length) {
            const nextKey = `book:${book.id}:page:${next}`;
            this.cache
              .getOrSet(nextKey, () =>
                this.http.get(`book-contents/${book.id}/${next}.html`, {
                  responseType: 'text',
                })
              )
              .subscribe();
          }
        }),
        take(1)
      );
  }
}
