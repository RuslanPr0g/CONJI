import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuessWordsComponent } from './guess-words.component';

describe('GuessWordsComponent', () => {
  let component: GuessWordsComponent;
  let fixture: ComponentFixture<GuessWordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuessWordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuessWordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
