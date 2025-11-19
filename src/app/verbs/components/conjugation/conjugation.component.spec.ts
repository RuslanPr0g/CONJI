import { provideHttpClient, HttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LoadVerbResourcesService } from '../../../shared/services/load-verb-resources.service';
import {
  getGroupFileNames,
  getGroupInformationFileName,
} from '../../../shared/const/files.const';
import { VerbGroup } from '../../../shared/models/verbs/verb-group.model';
import { ConjugationComponent } from './conjugation.component';

describe('ConjugationComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConjugationComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LoadVerbResourcesService,
      ],
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

    const expectedFiles = [...getGroupFileNames(false).map((o) => o.file)];

    const infoReq = httpMock.expectOne('group-information.json');
    infoReq.flush([
      { group: 1, name: 'Group 1 info' },
      { group: 2, name: 'Group 2 info' },
      { group: 3, name: 'Group 3 info' },
      { group: 4, name: 'Group 4 info' },
    ]);

    const groupFiles = expectedFiles.filter((f) => f.startsWith('group-'));
    for (const file of groupFiles) {
      const groupId = file.match(/group-(\d+)/)?.[1];
      httpMock
        .expectOne(file)
        .flush(mockGroups.find((g) => g.group === groupId)!);
    }

    tick();
    fixture.detectChanges();

    expect(component.groupedVerbs.length).toBe(4);
    expect(component.groupedVerbs[0].verbs[0].infinitive).toBe('a merge');
    expect(fixture.nativeElement.textContent).toContain('a merge');
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

    const expectedFiles = [...getGroupFileNames(false).map((o) => o.file)];

    const infoReq = httpMock.expectOne('group-information.json');
    infoReq.flush([
      { group: 1, name: 'Group 1 info' },
      { group: 2, name: 'Group 2 info' },
      { group: 3, name: 'Group 3 info' },
      { group: 4, name: 'Group 4 info' },
    ]);

    const groupFiles = expectedFiles.filter((f) => f.startsWith('group-'));
    for (const file of groupFiles) {
      const groupId = file.match(/group-(\d+)/)?.[1];
      httpMock
        .expectOne(file)
        .flush(mockGroups.find((g) => g.group === groupId)!);
    }

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

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient()],
      });
      http = TestBed.inject(HttpClient);
    });

    const envs = [false];
    for (const isProd of envs) {
      const publicFiles = [
        getGroupInformationFileName(isProd),
        ...getGroupFileNames(isProd).map((o) => o.file),
      ];

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
