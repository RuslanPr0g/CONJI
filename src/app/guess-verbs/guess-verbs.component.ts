import { Component, Input, OnInit } from '@angular/core';
import { VerbGroup, Verb } from '../app.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AddToPrefixPipe } from '../pipes/add-to-prefix.pipe';

@Component({
  selector: 'app-guess-verbs',
  standalone: true,
  imports: [AddToPrefixPipe, CommonModule, FormsModule],
  templateUrl: './guess-verbs.component.html',
  styleUrls: ['./guess-verbs.component.scss'],
})
export class GuessVerbsComponent implements OnInit {
  @Input() groups: VerbGroup[] = [];

  currentVerb!: Verb;
  guess: string = '';
  message: string = '';
  guessed = 0;
  missed = 0;
  showEnglish = true;

  lastTried: string | null = null;

  ngOnInit() {
    this.nextVerb();
  }

  private getAllVerbs(): Verb[] {
    return this.groups.flatMap((g) => g.verbs);
  }

  private nextVerb() {
    const verbs = this.getAllVerbs();
    const random = verbs[Math.floor(Math.random() * verbs.length)];
    this.currentVerb = random;
    this.showEnglish = Math.random() > 0.5;
    this.guess = '';
    this.message = '';
  }

  trySubmit(): boolean {
    const normalize = (text?: string) =>
      text
        ?.trim()
        .replace(/^(a|to)\s+/i, '')
        .replace(/\s*\(.*?\)\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase() ?? '';

    const userInput = normalize(this.guess);

    if (!userInput) {
      return false;
    }

    const possibleAnswers = this.showEnglish
      ? [normalize(this.currentVerb.infinitive)]
      : this.currentVerb.infinitive_translated?.map((t) => normalize(t)) ?? [];

    const isCorrect = possibleAnswers.some((ans) => ans === userInput);

    if (isCorrect) {
      this.guessTheWord();
    }

    return isCorrect;
  }

  submitGuess() {
    if (!this.guess) {
      this.nextVerb();
      return;
    }

    const isCorrect = this.trySubmit();

    if (isCorrect) {
      this.guessTheWord();
    } else {
      if (this.lastTried !== this.currentVerb.infinitive) {
        this.missed++;
      }

      this.message = `Greșit! Try again.`;
    }

    this.lastTried = this.currentVerb.infinitive;
  }

  private guessTheWord() {
    this.guessed++;
    this.message = 'Corect!';
    setTimeout(() => this.nextVerb(), 1000);
  }
}
