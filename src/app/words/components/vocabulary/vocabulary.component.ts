import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AddToPrefixPipe } from '../../../shared/pipes/add-to-prefix.pipe';
import { LoadWordResourcesService } from '../../services/load-word-resources.service';
import { getWordsFileName } from '../../const/files.const';
import { Word } from '../../models/word.model';
import { Router } from '@angular/router';
import { NavigationConst } from '../../../shared/const/navigation.const';

@Component({
  selector: 'app-vocabulary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AddToPrefixPipe],
  templateUrl: './vocabulary.component.html',
  styleUrl: './vocabulary.component.scss',
})
export class VocabularyComponent implements OnInit {
  @ViewChild('searchInput') inputRef!: ElementRef<HTMLInputElement>;

  searchControl = new FormControl('');
  allWords: Word[] = [];
  filteredWords: Word[] = [];
  copiedText: string | null = null;
  copyTimeout: ReturnType<typeof setTimeout> | null = null;

  releaseVersion = environment.releaseVersion;

  private loadService = inject(LoadWordResourcesService);

  private router = inject(Router);

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.inputRef?.nativeElement.blur();
  }

  ngOnInit(): void {
    const isProd = environment.production;

    this.loadService.getWords([getWordsFileName(isProd)]).subscribe({
      next: (words: Word[]) => {
        this.allWords = words;
        this.filteredWords = this.getRandomWords(words);
      },
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((search) => {
        if (!search?.trim()) {
          this.filteredWords = this.getRandomWords(this.allWords);
          return;
        }

        const norm = this.normalize(search);
        this.filteredWords = this.allWords.filter(
          (w) =>
            this.normalize(w.value).includes(norm) ||
            w.translations
              .map((t) => this.normalize(t))
              .some((t) => t.includes(norm))
        );
      });
  }

  copyToClipboard(value: string): void {
    if (this.copyTimeout) clearTimeout(this.copyTimeout);
    navigator.clipboard.writeText(value).then(() => {
      this.copiedText = value;
      this.copyTimeout = setTimeout(() => (this.copiedText = null), 1500);
    });
  }

  activateGamingMode(): void {
    // if (this.filteredGroups.length > 0) {
    //   this.isGamingMode = true;
    // }
  }

  navigateToVerbs(): void {
    this.router.navigate([NavigationConst.Conjugation]);
  }

  private getRandomWords(words: Word[], count = 30): Word[] {
    return [...words].sort(() => Math.random() - 0.5).slice(0, count);
  }

  private normalize(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
}
