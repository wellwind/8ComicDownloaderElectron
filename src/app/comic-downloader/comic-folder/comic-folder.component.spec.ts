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
    let comicDownloaderStub = {
      appSettings: {
        comicFolder: '/foo/bar'
      }
    }
    TestBed.configureTestingModule({
      declarations: [ComicFolderComponent],
      providers: [
        { provide: ComicDownloaderService, useValue: comicDownloaderStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComicFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    service = TestBed.get(ComicDownloaderService);
  });

  it('should get comic folder in setting file', () => {
    let saveComicFolder = fixture.debugElement.query(By.css('#saveComicFolder')).nativeElement as HTMLElement;
    expect(saveComicFolder.textContent).toBe('/foo/bar');
  });
});
