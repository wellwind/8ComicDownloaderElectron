import { AppModule } from './../../app.module';
/* tslint:disable:no-unused-variable */
import { ComicDownloaderComponent } from './comic-downloader.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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
      providers: [ComicDownloaderService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComicDownloaderComponent);
    component = fixture.componentInstance;

    service = TestBed.get(ComicDownloaderService);
    spyOn(service, 'readSettings');

    fixture.detectChanges();
  });

  it('should call service.readSettings initially', () => {
    expect(service.readSettings).toHaveBeenCalled();
  });
});
