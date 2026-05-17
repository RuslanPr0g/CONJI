import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuessWordsComponent } from './guess-words.component';

describe('GuessWordsComponent', () => {
  let component: GuessWordsComponent;
  let fixture: ComponentFixture<GuessWordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuessWordsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GuessWordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should track streaks and accuracy', () => {
    component.currentExercise = {
      question: 'Traducere în engleză: salut',
      correctAnswers: ['hello'],
      type: 'to-en',
    };
    component.guess = 'hello';

    expect(component.trySubmit()).toBeTrue();
    expect(component.guessed).toBe(1);
    expect(component.currentStreak).toBe(1);
    expect(component.bestStreak).toBe(1);
    expect(component.accuracy).toBe(100);

    component.loading = false;
    component.currentExercise = {
      question: 'Traducere în română: book',
      correctAnswers: ['carte'],
      type: 'to-ro',
    };
    component.guess = 'wrong';

    component.submitGuess();

    expect(component.missed).toBe(1);
    expect(component.currentStreak).toBe(0);
    expect(component.bestStreak).toBe(1);
    expect(component.accuracy).toBe(50);
  });
});
