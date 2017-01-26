/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ComicFolderComponent } from './comic-folder.component';
import { ComicDownloaderService } from './../comic-downloader.service';

describe('ComicFolderComponent', () => {
  let component: ComicFolderComponent;
  let fixture: ComponentFixture<ComicFolderComponent>;
  let service: ComicDownloaderService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ComicFolderComponent],
      providers: [ComicDownloaderService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComicFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    service = TestBed.get(ComicDownloaderService);
  });

  it('should display save comic folder', () => {
    component.appSettings = {
      comicFolder: '/foo/bar'
    };
    fixture.detectChanges();
    let saveComicFolder = fixture.debugElement.query(By.css('#saveComicFolder')).nativeElement as HTMLElement;
    expect(saveComicFolder.textContent).toBe('/foo/bar');
  });

  it('should call service.setComicFolder() when click setComicFolder button', () => {
    spyOn(service, 'setComicFolder');
    let setComicFolder = fixture.debugElement.query(By.css('#setComicFolder'));
    setComicFolder.triggerEventHandler('click', setComicFolder.nativeElement);

    expect(service.setComicFolder).toHaveBeenCalled();
  });

  it('should call service.openComicFolder() when click openComicFolder buttion', () => {
    spyOn(service, 'openComicFolder');
    let openComicFolder = fixture.debugElement.query(By.css('#openComicFolder'));
    openComicFolder.triggerEventHandler('click', openComicFolder.nativeElement);

    expect(service.openComicFolder).toHaveBeenCalled();
  });
});
