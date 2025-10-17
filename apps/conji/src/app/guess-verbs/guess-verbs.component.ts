import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { VerbGroup, Verb } from '../app.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

interface Exercise {
  question: string;
  correctAnswers: string[];
  type: string;
}

@Component({
  selector: 'app-guess-verbs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guess-verbs.component.html',
  styleUrls: ['./guess-verbs.component.scss'],
})
export class GuessVerbsComponent implements OnInit {
  @ViewChild('guessInput') inputRef!: ElementRef<HTMLInputElement>;

  exercises: Exercise[] = [];
  currentExercise!: Exercise;
  guess = '';
  message = '';
  guessed = 0;
  missed = 0;
  loading = false;
  lastTried: string | null = null;

  @Input() groups: VerbGroup[] = [];

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
    const verbs = this.groups.flatMap((g) => g.verbs);
    const exs: Exercise[] = [];

    for (const verb of verbs) {
      if (verb.infinitive_translated) {
        exs.push({
          question: `Traducere în română: ${verb.infinitive_translated[0]}`,
          correctAnswers: [verb.infinitive],
          type: 'translate-to-ro',
        });
        exs.push({
          question: `Traducere în engleză: a ${verb.infinitive}`,
          correctAnswers: verb.infinitive_translated.map((t) =>
            t.toLowerCase().trim()
          ),
          type: 'translate-to-en',
        });
      }

      const persons = ['eu', 'tu', 'el/ea', 'noi', 'voi', 'ei/ele'] as const;

      for (const p of persons) {
        exs.push({
          question: `(Prezent): ${p} ___ (${verb.infinitive})`,
          correctAnswers: [verb.conjugations.prezent[p]],
          type: 'conjugate-prezent',
        });
        exs.push({
          question: `(Perfect compus): ${p} ___ (${verb.infinitive})`,
          correctAnswers: [verb.conjugations.perfect_compus[p]],
          type: 'conjugate-past',
        });

        const vrea = this.getVerb('vrea');
        if (vrea) {
          exs.push({
            question: `${p} ___ să ___ (${verb.infinitive}) (prezent, cu "a vrea")`,
            correctAnswers: Array.from(
              new Set([
                ...p
                  .split('/')
                  .map(
                    (splitted) =>
                      `${splitted} ${vrea.conjugations.prezent[p]} ${verb.conjugations.conjunctiv[p]}`
                  ),
                `${p} ${vrea.conjugations.prezent[p]} ${verb.conjugations.conjunctiv[p]}`,
                `${vrea.conjugations.prezent[p]}${verb.conjugations.conjunctiv[
                  p
                ]
                  .replace('să', '')
                  .replace('  ', ' ')}`,
                `${vrea.conjugations.prezent[p]} ${verb.conjugations.conjunctiv[p]}`,
              ])
            ),
            type: 'vrea-prezent',
          });

          exs.push({
            question: `${p} ___ să ___ (${verb.infinitive}) (trecut, cu "a vrea")`,
            correctAnswers: Array.from(
              new Set([
                ...p
                  .split('/')
                  .map(
                    (splitted) =>
                      `${splitted} ${vrea.conjugations.perfect_compus[p]} ${verb.conjugations.conjunctiv[p]}`
                  ),
                `${p} ${vrea.conjugations.perfect_compus[p]} ${verb.conjugations.conjunctiv[p]}`,
                `${
                  vrea.conjugations.perfect_compus[p]
                }${verb.conjugations.conjunctiv[p]
                  .replace('să', '')
                  .replace('  ', ' ')}`,
                `${vrea.conjugations.perfect_compus[p]} ${verb.conjugations.conjunctiv[p]}`,
              ])
            ),
            type: 'vrea-past',
          });
        }
      }
    }

    this.exercises = exs;
  }

  private getVerb(infinitive: string): Verb | undefined {
    return this.groups
      .flatMap((g) => g.verbs)
      .find((v) => v.infinitive === infinitive);
  }

  private nextExercise(shouldRemove = false) {
    if (!this.exercises.length) {
      this.buildExercises();
    }

    const index = Math.floor(Math.random() * this.exercises.length);
    this.currentExercise = this.exercises[index];

    if (shouldRemove) {
      this.exercises.splice(index, 1);
    }

    if (!this.exercises.length) {
      this.buildExercises();
    }

    this.guess = '';
    this.message = '';
    this.loading = false;

    setTimeout(() => {
      this.inputRef.nativeElement.focus();
      this.inputRef.nativeElement.select();
    }, 300);
  }

  private normalize(text?: string) {
    return (
      text
        ?.trim()
        .replace(/^(a|to)\s+/i, '')
        .replace(/\s*\(.*?\)\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase() ?? ''
    );
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
