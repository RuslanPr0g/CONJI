import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, map, Observable } from 'rxjs';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root',
})
export class LoadBooksResourcesService {
  http = inject(HttpClient);

  getBooks(files: string[]) {
    const requests = files.map((file) => this.http.get<Book[]>(file));

    return combineLatest(requests).pipe(
      map((lists) => lists.flat()),
      map((books) => {
        const seen = new Set<string>();
        return books.filter((b) => {
          const key = b.title?.trim().toLowerCase();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      })
    );
  }

  loadBookPage(book: Book, pageNumber: number): Observable<string> {
    if (!book.id) {
      throw new Error('Book must have an id');
    }

    if (pageNumber < 1 || pageNumber > book.content_length) {
      throw new Error(
        `Page number must be between 1 and ${book.content_length}`
      );
    }

    const url = `book-contents/${book.id}/${pageNumber}.html`;
    return this.http.get<string>(url);
  }
}
