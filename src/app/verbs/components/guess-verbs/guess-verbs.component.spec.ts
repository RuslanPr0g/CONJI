import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuessVerbsComponent } from './guess-verbs.component';

describe('GuessVerbsComponent', () => {
  let component: GuessVerbsComponent;
  let fixture: ComponentFixture<GuessVerbsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuessVerbsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GuessVerbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should track streaks and accuracy', () => {
    component.currentExercise = {
      question: '(Prezent): eu ___ (a merge)',
      correctAnswers: ['merg'],
      type: 'conjugate-prezent',
    };
    component.guess = 'merg';

    expect(component.trySubmit()).toBeTrue();
    expect(component.guessed).toBe(1);
    expect(component.currentStreak).toBe(1);
    expect(component.bestStreak).toBe(1);
    expect(component.accuracy).toBe(100);

    component.loading = false;
    component.currentExercise = {
      question: '(Prezent): tu ___ (a merge)',
      correctAnswers: ['mergi'],
      type: 'conjugate-prezent',
    };
    component.guess = 'wrong';

    component.submitGuess();

    expect(component.missed).toBe(1);
    expect(component.currentStreak).toBe(0);
    expect(component.bestStreak).toBe(1);
    expect(component.accuracy).toBe(50);
  });
});
