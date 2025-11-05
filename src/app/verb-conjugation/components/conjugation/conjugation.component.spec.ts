import { provideHttpClient, HttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { VerbGroup } from '../../models/verb-group.model';
import { VerbInformationGroup } from '../../models/verb-information-group.model';
import { ConjugationComponent } from './conjugation.component';

describe('ConjugationComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConjugationComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(ConjugationComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should load verbs from all group files and display them', fakeAsync(() => {
    const fixture = TestBed.createComponent(ConjugationComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    const mockGroups: VerbGroup[] = [
      {
        group: '1',
        verbs: [
          {
            infinitive: 'a merge',
            group: 1,
            subgroup: 1,
            conjugations: {
              prezent: {
                eu: 'merg',
                tu: 'mergi',
                'el/ea': 'merge',
                noi: 'mergem',
                voi: 'mergeți',
                'ei/ele': 'merg',
              },
              perfect_compus: {
                eu: '',
                tu: '',
                'el/ea': '',
                noi: '',
                voi: '',
                'ei/ele': '',
              },
              viitor_literar: {
                eu: '',
                tu: '',
                'el/ea': '',
                noi: '',
                voi: '',
                'ei/ele': '',
              },
              viitor_familiar: {
                eu: '',
                tu: '',
                'el/ea': '',
                noi: '',
                voi: '',
                'ei/ele': '',
              },
              conjunctiv: {
                eu: '',
                tu: '',
                'el/ea': '',
                noi: '',
                voi: '',
                'ei/ele': '',
              },
              conditional: {
                eu: '',
                tu: '',
                'el/ea': '',
                noi: '',
                voi: '',
                'ei/ele': '',
              },
              imperativ: { tu: '', voi: '' },
            },
          },
        ],
      },
      { group: '2', verbs: [] },
      { group: '3', verbs: [] },
      { group: '4', verbs: [] },
    ];

    const mockGroupInfo: VerbInformationGroup[] = [
      { group: 1, description: 'test group', subgroups: [] },
    ];

    httpMock.expectOne('group-1.json').flush(mockGroups[0]);
    httpMock.expectOne('group-2.json').flush(mockGroups[1]);
    httpMock.expectOne('group-3.json').flush(mockGroups[2]);
    httpMock.expectOne('group-4.json').flush(mockGroups[3]);

    httpMock.expectOne('group-information.json').flush(mockGroupInfo);

    tick();
    fixture.detectChanges();

    expect(component.groupedVerbs.length).toBe(4);
    expect(component.groupedVerbs[0].verbs[0].infinitive).toBe('a merge');

    const textContent = fixture.nativeElement.textContent;
    expect(textContent).toContain('a merge');
  }));

  it('should update filtered verbs when search value changes', fakeAsync(() => {
    const fixture = TestBed.createComponent(ConjugationComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const mockGroups: VerbGroup[] = [
      {
        group: '1',
        verbs: [
          {
            infinitive: 'a merge',
            group: 1,
            subgroup: 1,
            conjugations: {
              prezent: {
                eu: 'merg',
                tu: 'mergi',
                'el/ea': 'merge',
                noi: 'mergem',
                voi: 'mergeți',
                'ei/ele': 'merg',
              },
              perfect_compus: {
                eu: '',
                tu: '',
                'el/ea': '',
                noi: '',
                voi: '',
                'ei/ele': '',
              },
              viitor_literar: {
                eu: '',
                tu: '',
                'el/ea': '',
                noi: '',
                voi: '',
                'ei/ele': '',
              },
              viitor_familiar: {
                eu: '',
                tu: '',
                'el/ea': '',
                noi: '',
                voi: '',
                'ei/ele': '',
              },
              conjunctiv: {
                eu: '',
                tu: '',
                'el/ea': '',
                noi: '',
                voi: '',
                'ei/ele': '',
              },
              conditional: {
                eu: '',
                tu: '',
                'el/ea': '',
                noi: '',
                voi: '',
                'ei/ele': '',
              },
              imperativ: { tu: '', voi: '' },
            },
          },
          {
            infinitive: 'a vedea',
            group: 1,
            subgroup: 1,
            conjugations: {
              prezent: {
                eu: 'văd',
                tu: 'vezi',
                'el/ea': 'vede',
                noi: 'vedem',
                voi: 'vedeți',
                'ei/ele': 'văd',
              },
              perfect_compus: {
                eu: '',
                tu: '',
                'el/ea': '',
                noi: '',
                voi: '',
                'ei/ele': '',
              },
              viitor_literar: {
                eu: '',
                tu: '',
                'el/ea': '',
                noi: '',
                voi: '',
                'ei/ele': '',
              },
              viitor_familiar: {
                eu: '',
                tu: '',
                'el/ea': '',
                noi: '',
                voi: '',
                'ei/ele': '',
              },
              conjunctiv: {
                eu: '',
                tu: '',
                'el/ea': '',
                noi: '',
                voi: '',
                'ei/ele': '',
              },
              conditional: {
                eu: '',
                tu: '',
                'el/ea': '',
                noi: '',
                voi: '',
                'ei/ele': '',
              },
              imperativ: { tu: '', voi: '' },
            },
          },
        ],
      },
      { group: '2', verbs: [] },
      { group: '3', verbs: [] },
      { group: '4', verbs: [] },
    ];

    const mockGroupInfo: VerbInformationGroup[] = [
      { group: 1, description: 'test group', subgroups: [] },
    ];

    httpMock.expectOne('group-1.json').flush(mockGroups[0]);
    httpMock.expectOne('group-2.json').flush(mockGroups[1]);
    httpMock.expectOne('group-3.json').flush(mockGroups[2]);
    httpMock.expectOne('group-4.json').flush(mockGroups[3]);
    httpMock.expectOne('group-information.json').flush(mockGroupInfo);

    tick();
    fixture.detectChanges();

    component.searchControl.setValue('merge');
    tick(300);
    fixture.detectChanges();

    const filtered = component.filteredGroups.flatMap((g) =>
      g.verbs.map((v) => v.infinitive)
    );
    expect(filtered).toContain('a merge');
    expect(filtered).not.toContain('a vedea');
  }));

  describe('Public assets loading', () => {
    let http: HttpClient;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        providers: [provideHttpClient()],
      }).compileComponents();

      http = TestBed.inject(HttpClient);
    });

    const publicFiles = [
      'group-1.json',
      'group-2.json',
      'group-3.json',
      'group-4.json',
      'group-information.json',
    ];

    for (const file of publicFiles) {
      it(`should load ${file} from the public/assets folder`, (done) => {
        http.get(`/${file}`).subscribe({
          next: (data) => {
            expect(data).toBeTruthy();
            done();
          },
          error: (err) => {
            fail(
              `${file} could not be loaded from /public or /assets — check angular.json "assets" config`
            );
            done();
          },
        });
      });
    }
  });
});
