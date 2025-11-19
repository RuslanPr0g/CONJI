import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavigationConst } from './shared/const/navigation.const';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private router = inject(Router);

  releaseVersion = environment.releaseVersion;

  navigateToWords(): void {
    this.router.navigate([NavigationConst.Vocabulary]);
  }

  navigateToVerbs(): void {
    this.router.navigate([NavigationConst.Conjugation]);
  }

  navigateToBooks(): void {
    this.router.navigate([NavigationConst.Books]);
  }

  get isWordsPage(): boolean {
    return this.router.url.includes(NavigationConst.Vocabulary);
  }

  get isVerbsPage(): boolean {
    return this.router.url.includes(NavigationConst.Conjugation);
  }

  get isBooksPage(): boolean {
    return this.router.url.includes(NavigationConst.Books);
  }

  get isBookPage(): boolean {
    return this.router.url.includes(NavigationConst.ReadBook);
  }
}
