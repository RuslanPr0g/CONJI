import { Component, Input, OnInit } from '@angular/core';
import { VerbGroup, Verb } from '../app.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  @Input() groups: VerbGroup[] = [];

  exercises: Exercise[] = [];
  currentExercise!: Exercise;
  guess: string = '';
  message: string = '';
  guessed = 0;
  missed = 0;
  loading = false;
  lastTried: string | null = null;

  ngOnInit() {
    this.buildExercises();
    this.nextExercise();
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
            correctAnswers: [
              `${vrea.conjugations.prezent[p]} să ${verb.conjugations.conjunctiv[p]}`,
            ],
            type: 'vrea-prezent',
          });

          exs.push({
            question: `${p} ___ să ___ (${verb.infinitive}) (trecut, cu "a vrea")`,
            correctAnswers: [
              `${vrea.conjugations.prezent[p]} să ${verb.conjugations.perfect_compus[p]}`,
            ],
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

  private nextExercise() {
    this.currentExercise =
      this.exercises[Math.floor(Math.random() * this.exercises.length)];
    this.guess = '';
    this.message = '';
    this.loading = false;
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
    if (isCorrect) {
      this.guessTheWord();
    } else {
      if (this.lastTried !== this.currentExercise.question) this.missed++;
      this.message = `Greșit! Try again.`;
    }
    this.lastTried = this.currentExercise.question;
  }

  private guessTheWord() {
    this.guessed++;
    this.message = 'Corect!';
    this.loading = true;
    setTimeout(() => this.nextExercise(), 1500);
  }
}
