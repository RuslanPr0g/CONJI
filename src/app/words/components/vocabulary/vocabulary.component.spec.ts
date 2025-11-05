import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { VocabularyComponent } from './vocabulary.component';
import { environment } from '../../../../environments/environment';
import { getWordsFileName } from '../../const/files.const';
import { Word } from '../../models/word.model';
import { LoadWordResourcesService } from '../../services/load-word-resources.service';

describe('VocabularyComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VocabularyComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LoadWordResourcesService,
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(VocabularyComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should load words from JSON and populate filteredWords', fakeAsync(() => {
    const fixture = TestBed.createComponent(VocabularyComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const mockWords: Word[] = [
      { value: 'carte', translations: ['book'] },
      { value: 'floare', translations: ['flower'] },
      { value: 'pisică', translations: ['cat'] },
    ];

    const expectedFile = getWordsFileName(environment.production);

    const req = httpMock.expectOne(expectedFile);
    req.flush(mockWords);

    tick();
    fixture.detectChanges();

    expect(component.allWords.length).toBe(3);
    expect(component.filteredWords.length).toBeGreaterThan(0);
    expect(component.filteredWords.some((w) => w.value === 'carte')).toBeTrue();
  }));

  it('should filter words when searchControl changes', fakeAsync(() => {
    const fixture = TestBed.createComponent(VocabularyComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const mockWords: Word[] = [
      { value: 'carte', translations: ['book'] },
      { value: 'floare', translations: ['flower'] },
      { value: 'pisică', translations: ['cat'] },
    ];

    const expectedFile = getWordsFileName(environment.production);
    const req = httpMock.expectOne(expectedFile);
    req.flush(mockWords);

    tick();
    fixture.detectChanges();

    component.searchControl.setValue('floare');
    tick(300);
    fixture.detectChanges();

    expect(component.filteredWords.length).toBe(1);
    expect(component.filteredWords[0].value).toBe('floare');
  }));

  describe('Public assets loading', () => {
    let http: HttpClient;

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient()],
      });
      http = TestBed.inject(HttpClient);
    });

    const envs = [false];
    for (const isProd of envs) {
      const publicFiles = [getWordsFileName(isProd)];

      for (const file of publicFiles) {
        it(`(${
          isProd ? 'prod' : 'dev'
        }) should load ${file} from public/`, (done) => {
          http.get(`/${file}`).subscribe({
            next: () => done(),
            error: () => {
              fail(`${file} missing in /public or /assets`);
              done();
            },
          });
        });
      }
    }
  });
});
