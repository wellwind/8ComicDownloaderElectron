import { ElectronService } from './../../shared/services/electron.service';
/* tslint:disable:no-unused-variable */
import { ComicDownloaderComponent } from './comic-downloader.component';
import { async, fakeAsync, tick, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComicDownloaderService } from './../comic-downloader.service';

describe('ComicDownloaderComponent', () => {
  let component: ComicDownloaderComponent;
  let fixture: ComponentFixture<ComicDownloaderComponent>;

  let service: ComicDownloaderService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ComicDownloaderComponent],
      providers: [ComicDownloaderService, ElectronService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComicDownloaderComponent);
    component = fixture.componentInstance;

    service = TestBed.get(ComicDownloaderService);
  });

  it('should call service.readSettingsPromise() initially', () => {
    spyOn(service, 'readSettingsPromise').and.returnValue({ then: () => { }, catch: () => { } });
    fixture.detectChanges();
    expect(service.readSettingsPromise).toHaveBeenCalled();
  });

  it('should get appSettings after call service.readSettingsPromise()', fakeAsync(() => {
    spyOn(service, 'readSettings').and.callFake((callback) => {
      component.appSettings = { foo: 'bar'};
      callback();
    });

    service.appSettings = { foo: 'bar'};
    fixture.detectChanges();
    tick();

    expect(component.appSettings).toEqual({ foo: 'bar' });
  }));
});
