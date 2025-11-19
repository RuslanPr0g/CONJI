import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Word } from '../../../shared/models/words/word.model';

interface Exercise {
  question: string;
  correctAnswers: string[];
  type: 'to-ro' | 'to-en';
}

@Component({
  selector: 'app-guess-words',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guess-words.component.html',
  styleUrls: ['./guess-words.component.scss'],
})
export class GuessWordsComponent implements OnInit {
  @ViewChild('guessInput') inputRef!: ElementRef<HTMLInputElement>;
  @Input() words: Word[] = [];

  exercises: Exercise[] = [];
  currentExercise!: Exercise;
  guess = '';
  message = '';
  guessed = 0;
  missed = 0;
  loading = false;
  lastTried: string | null = null;

  ngOnInit() {
    this.buildExercises();
    this.nextExercise();
  }

  @HostListener('document:keydown', ['$event'])
  handleCtrlD(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'd' && !environment.production) {
      event.preventDefault();
      console.warn(this.currentExercise);
    }
  }

  get exercisesLeftAmount() {
    return this.exercises.length;
  }

  private buildExercises() {
    const exs: Exercise[] = [];

    for (const w of this.words) {
      const allTranslations =
        w.translations?.map((t) => t.toLowerCase().trim()) ?? [];
      const mainTranslation = allTranslations[0] ?? '';

      exs.push({
        question: `Traducere în română: ${mainTranslation}`,
        correctAnswers: [w.value.toLowerCase().trim()],
        type: 'to-ro',
      });

      exs.push({
        question: `Traducere în engleză: ${w.value}`,
        correctAnswers: allTranslations,
        type: 'to-en',
      });
    }

    this.exercises = exs;
  }

  private nextExercise(shouldRemove = false) {
    if (!this.exercises.length) this.buildExercises();

    const index = Math.floor(Math.random() * this.exercises.length);
    this.currentExercise = this.exercises[index];

    if (shouldRemove) this.exercises.splice(index, 1);

    if (!this.exercises.length) this.buildExercises();

    this.guess = '';
    this.message = '';
    this.loading = false;

    setTimeout(() => {
      this.inputRef.nativeElement.focus();
      this.inputRef.nativeElement.select();
    }, 300);
  }

  private normalize(text?: string) {
    return text?.trim().toLowerCase() ?? '';
  }

  trySubmit(): boolean {
    const userInput = this.normalize(this.guess);
    if (!userInput || this.loading) return false;

    const isCorrect = this.currentExercise.correctAnswers.some(
      (ans) => this.normalize(ans) === userInput
    );

    if (isCorrect) this.guessTheWord();
    return isCorrect;
  }

  submitGuess() {
    if (this.loading) return;
    if (!this.guess) {
      this.nextExercise();
      return;
    }

    const isCorrect = this.trySubmit();
    if (isCorrect) return;

    if (this.lastTried !== this.currentExercise.question) this.missed++;
    this.message = `Greșit! Try again.`;
    this.lastTried = this.currentExercise.question;
  }

  private guessTheWord() {
    this.guessed++;
    this.message = 'Corect!';
    this.loading = true;
    setTimeout(() => this.nextExercise(true), 1500);
  }
}
