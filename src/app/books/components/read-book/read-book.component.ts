import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadBooksResourcesService } from '../../services/load-books-resources.service';
import { Book } from '../../models/book.model';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import {
  getBooksFileName,
  getGroupFileNames,
  getWordsFileName,
} from '../../../shared/const/files.const';
import { LocalStorageService } from '../../../shared/services/local-storage.service';
import { TranslatorService } from '../../../shared/services/translator.service';
import { forkJoin } from 'rxjs';
import { LoadWordResourcesService } from '../../../shared/services/load-word-resources.service';
import { LoadVerbResourcesService } from '../../../shared/services/load-verb-resources.service';

@Component({
  selector: 'app-read-book',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './read-book.component.html',
  styleUrls: ['./read-book.component.scss'],
})
export class ReadBookComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private loadService = inject(LoadBooksResourcesService);
  private loadWordsService = inject(LoadWordResourcesService);
  private loadVerbsService = inject(LoadVerbResourcesService);
  private storage = inject(LocalStorageService);
  private translator = inject(TranslatorService);

  book: Book | undefined;
  currentPage = 1;
  pageContent = '';
  totalPages = 0;
  loading = false;
  error = '';

  selection?: string;
  translation?: string;

  showLastReadButton = false;

  private touchStartX = 0;
  private touchEndX = 0;
  private minSwipeDistance = 110;

  ngOnInit(): void {
    const isProd = environment.production;
    const bookId = this.route.snapshot.paramMap.get('id');
    if (!bookId) {
      this.error = 'Book ID not provided';
      return;
    }

    this.loadService.getBooks([getBooksFileName(isProd)]).subscribe({
      next: (books: Book[]) => {
        this.book = books.find((b) => b.id === bookId);
        if (!this.book) {
          this.error = 'Book not found';
          return;
        }
        this.totalPages = this.book.content_length;
        this.loadLastReadOrFirstPage();
      },
      error: () => (this.error = 'Failed to load books'),
    });

    forkJoin([
      this.loadWordsService.getWords([getWordsFileName(isProd)]),
      this.loadVerbsService.getVerbGroups(
        getGroupFileNames(isProd).map((f) => f.file)
      ),
    ]).subscribe({
      next: ([words, verbGroups]) => {
        this.translator.init(words, verbGroups);
      },
    });
  }

  translateSelection() {
    const selection = window.getSelection()?.toString().trim();
    if (!selection) {
      this.selection = undefined;
      this.translation = undefined;
      return;
    }

    const translated = this.translator.translateText(selection);

    if (selection !== translated) {
      this.selection = selection;
      this.translation = translated;
    } else {
      this.selection = undefined;
      this.translation = undefined;
    }
  }

  private getStorageKey(): string {
    return `book-${this.book?.id}-last-read`;
  }

  private loadLastReadOrFirstPage() {
    if (!this.book) {
      return;
    }

    const lastRead = this.storage.get(this.getStorageKey());
    if (lastRead && +lastRead !== this.currentPage) {
      this.showLastReadButton = true;
    }

    this.loadPage(1, false);
  }

  loadPage(pageNumber: number, save = true) {
    if (!this.book) {
      return;
    }
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return;
    }

    this.loading = true;
    this.loadService.loadBookPage(this.book, pageNumber).subscribe({
      next: (content: string) => {
        this.pageContent = content;
        this.currentPage = pageNumber;
        this.loading = false;

        if (save) {
          this.storage.set(this.getStorageKey(), pageNumber.toString());
          this.updateLastReadButtonVisibility();
        }
      },
      error: () => {
        this.error = 'Failed to load page';
        this.loading = false;
      },
    });
  }

  private updateLastReadButtonVisibility() {
    const lastRead = this.storage.get(this.getStorageKey());
    this.showLastReadButton =
      !!lastRead &&
      +lastRead !== this.currentPage &&
      +lastRead <= this.totalPages;
  }

  goToLastRead() {
    this.showLastReadButton = false;
    const lastRead = this.storage.get(this.getStorageKey());
    if (!lastRead) return;
    this.loadPage(+lastRead);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.loadPage(this.currentPage + 1);
  }

  prevPage() {
    if (this.currentPage > 1) this.loadPage(this.currentPage - 1);
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe() {
    const distance = this.touchEndX - this.touchStartX;

    if (Math.abs(distance) > this.minSwipeDistance) {
      if (distance < 0) {
        this.nextPage();
      } else {
        this.prevPage();
      }
    }
  }
}
