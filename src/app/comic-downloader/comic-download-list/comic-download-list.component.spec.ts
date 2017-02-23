/* tslint:disable:no-unused-variable */
import * as path from 'path';
import { ComicDownloaderModule } from '../comic-downloader.module';
import { ElectronService } from './../../shared/services/electron.service';
import { ComicImageDownloadStatus } from './../../shared/enums/comic-image-download-status.enum';
import { ComicDownloaderService } from './../comic-downloader.service';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ComicDownloadListComponent } from './comic-download-list.component';

describe('ComicDownloadListComponent', () => {
  let component: ComicDownloadListComponent;
  let fixture: ComponentFixture<ComicDownloadListComponent>;
  let service: ComicDownloaderService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ComicDownloaderModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComicDownloadListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    service = TestBed.get(ComicDownloaderService);
  });

  it('should binding service.toDownloadComicImageList', fakeAsync(() => {
    service.toDownloadComicImageList = [
      {
        savedPath: `TestComic${path.sep}0003${path.sep}image01.jpg`,
        imageUrl: 'http://comic/0003/image01.jpg',
        status: ComicImageDownloadStatus.Ready
      },
      {
        savedPath: `TestComic${path.sep}0003${path.sep}image02.jpg`,
        imageUrl: 'http://comic/0003/image02.jpg',
        status: ComicImageDownloadStatus.Error
      },
      {
        savedPath: `TestComic${path.sep}0004${path.sep}image01.jpg`,
        imageUrl: 'http://comic/0004/image01.jpg',
        status: ComicImageDownloadStatus.Finish
      },
      {
        savedPath: `TestComic${path.sep}0004${path.sep}image02.jpg`,
        imageUrl: 'http://comic/0004/image02.jpg',
        status: ComicImageDownloadStatus.Downloading
      },
    ];
    fixture.detectChanges();
    const imageList = fixture.debugElement.queryAll(By.css('#imageList > tbody > tr'));

    expect(service.toDownloadComicImageList.length).toBe(imageList.length);

    expect((imageList[0].queryAll(By.css('td'))[0].nativeElement).textContent).toBe('準備中');
    expect((imageList[1].queryAll(By.css('td'))[0].nativeElement).textContent).toBe('錯誤');
    expect((imageList[2].queryAll(By.css('td'))[0].nativeElement).textContent).toBe('完成');
    expect((imageList[3].queryAll(By.css('td'))[0].nativeElement).textContent).toBe('下載中');

    expect((imageList[0].queryAll(By.css('td'))[1].nativeElement).textContent).toBe(`TestComic${path.sep}0003${path.sep}image01.jpg`);
    expect((imageList[0].queryAll(By.css('td'))[2].nativeElement).textContent).toBe('http://comic/0003/image01.jpg');

    expect((imageList[3].queryAll(By.css('td'))[1].nativeElement).textContent).toBe(`TestComic${path.sep}0004${path.sep}image02.jpg`);
    expect((imageList[3].queryAll(By.css('td'))[2].nativeElement).textContent).toBe(`http://comic/0004/image02.jpg`);
  }));

  describe('start download', () => {
    beforeEach(() => {
      spyOn(service, 'startDownload').and.returnValue(new Promise((resolve) => {
        resolve();
      }));

      spyOn(window, 'alert');
    });

    it('should call service.startDownload()', () => {
      component.startDownload();
      expect(service.startDownload).toHaveBeenCalled();
    });

    it('should alert after download complete', fakeAsync(() => {
      component.startDownload();
      tick();

      expect(window.alert).toHaveBeenCalledWith('全部下載完成');
    }));
  });

});
