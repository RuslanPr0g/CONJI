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
import { LoadWordResourcesService } from '../../../shared/services/load-word-resources.service';
import { Word } from '../../../shared/models/words/word.model';
import { GuessWordsComponent } from '../guess-words/guess-words.component';
import { normalize } from '../../../shared/helpers/string.helper';
import { getWordsFileName } from '../../../shared/const/files.const';

@Component({
  selector: 'app-vocabulary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GuessWordsComponent],
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

  isGamingMode = false;

  private loadService = inject(LoadWordResourcesService);

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.inputRef?.nativeElement?.blur();
  }

  @HostListener('document:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'f') {
      event.preventDefault();

      this.inputRef?.nativeElement?.focus();
    } else if (event.ctrlKey && event.key === 'p') {
      event.preventDefault();

      this.activateGamingMode();
    }
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

        const norm = normalize(search);
        this.filteredWords = this.allWords.filter(
          (w) =>
            normalize(w.value).includes(norm) ||
            w.translations
              .map((t) => normalize(t))
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

  closePopup(): void {
    this.isGamingMode = false;
  }

  activateGamingMode(): void {
    if (this.filteredWords.length > 0) {
      this.isGamingMode = true;
    }
  }

  private getRandomWords(words: Word[]): Word[] {
    return [...words].sort(() => Math.random() - 0.5);
  }
}
