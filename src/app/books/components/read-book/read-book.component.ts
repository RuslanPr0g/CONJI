import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadBooksResourcesService } from '../../services/load-books-resources.service';
import { Book } from '../../models/book.model';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { getBooksFileName } from '../../const/files.const';

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

  book: Book | undefined;
  currentPage = 1;
  pageContent = '';
  totalPages = 0;
  loading = false;
  error = '';

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
        this.loadPage(this.currentPage);
      },
      error: () => (this.error = 'Failed to load books'),
    });
  }

  loadPage(pageNumber: number) {
    if (!this.book) return;
    if (pageNumber < 1 || pageNumber > this.totalPages) return;

    this.loading = true;
    this.loadService.loadBookPage(this.book, pageNumber).subscribe({
      next: (content: string) => {
        this.pageContent = content;
        this.currentPage = pageNumber;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load page';
        this.loading = false;
      },
    });
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
