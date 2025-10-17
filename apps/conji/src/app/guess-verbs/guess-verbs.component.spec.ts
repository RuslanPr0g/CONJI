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
});
