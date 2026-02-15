import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavigationConst } from './shared/const/navigation.const';
import { environment } from '../environments/environment';
import { SpaceBackgroundComponent } from './shared/components/space-background/space-background.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SpaceBackgroundComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private router = inject(Router);

  releaseVersion = environment.releaseVersion;
  isProductionEnvironment = environment.production;

  navigateToWords(): void {
    this.router.navigate([NavigationConst.Vocabulary]);
  }

  navigateToVerbs(): void {
    this.router.navigate([NavigationConst.Conjugation]);
  }

  navigateToBooks(): void {
    this.router.navigate([NavigationConst.Books]);
  }

  navigateToDiagnostics(): void {
    this.router.navigate([NavigationConst.Diagnostics]);
  }

  get isWordsPage(): boolean {
    return this.router.url.includes(NavigationConst.Vocabulary);
  }

  get isVerbsPage(): boolean {
    return this.router.url.includes(NavigationConst.Conjugation);
  }

  get isBooksPage(): boolean {
    return (
      this.router.url.includes(NavigationConst.Books) &&
      !this.router.url.includes(NavigationConst.Diagnostics)
    );
  }

  get isBookPage(): boolean {
    return this.router.url.includes(NavigationConst.ReadBook);
  }

  get isDiagnosticsPage(): boolean {
    return this.router.url.includes(NavigationConst.Diagnostics);
  }
}
