import { environment } from '../../../../environments/environment';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getBooksFileName } from '../../../shared/const/files.const';
import { LoadBooksResourcesService } from '../../services/load-books-resources.service';
import { Book } from '../../models/book.model';
import { NavigationConst } from '../../../shared/const/navigation.const';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-books',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-books.component.html',
  styleUrls: ['./list-books.component.scss'],
})
export class ListBooksComponent implements OnInit {
  private loadService = inject(LoadBooksResourcesService);
  private router = inject(Router);

  allBooks: Book[] = [];

  ngOnInit(): void {
    const isProd = environment.production;

    this.loadService.getBooks([getBooksFileName(isProd)]).subscribe({
      next: (books: Book[]) => {
        this.allBooks = books;
      },
      error: (err) => console.error('Failed to load books', err),
    });
  }

  openBook(book: Book) {
    this.router.navigate([NavigationConst.ReadBook, book.id]);
  }
}
