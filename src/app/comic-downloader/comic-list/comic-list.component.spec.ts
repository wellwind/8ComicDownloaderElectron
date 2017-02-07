/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ComicListComponent } from './comic-list.component';
import { ComicDownloaderService } from './../comic-downloader.service';
import { ElectronService } from './../../shared/services/electron.service';
import { ComicDownloaderModule } from './../comic-downloader.module';

describe('ComicListComponent', () => {
  let component: ComicListComponent;
  let fixture: ComponentFixture<ComicListComponent>;
  let service: ComicDownloaderService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ComicDownloaderModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComicListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    service = TestBed.get(ComicDownloaderService);
  });

  describe('add comic url', () => {
    it('should call component.addComicUrl', () => {
      spyOn(component, 'addComicUrl');

      const addComicUrlButton = fixture.debugElement.query(By.css('#addComicUrlButton'));
      addComicUrlButton.triggerEventHandler('click', addComicUrlButton);

      expect(component.addComicUrl).toHaveBeenCalled();
    });

    it('should call service.addComicUrl', () => {
      spyOn(service, 'addComicUrl');

      component.urlToAdd = 'test url...';
      const addComicUrlButton = fixture.debugElement.query(By.css('#addComicUrlButton'));

      addComicUrlButton.triggerEventHandler('click', addComicUrlButton);

      expect(service.addComicUrl).toHaveBeenCalledWith('test url...');
    });

    it('should not call service.addComicUrl when urlToAdd not input', () => {
      spyOn(service, 'addComicUrl');

      component.urlToAdd = '';
      const addComicUrlButton = fixture.debugElement.query(By.css('#addComicUrlButton'));

      addComicUrlButton.triggerEventHandler('click', addComicUrlButton);

      expect(service.addComicUrl).toHaveBeenCalledTimes(0);
    });
  });

  describe('comic list selection', () => {
    it('should show all comics', () => {
      component.appSettings = {
        comicList: [
          { name: 'Comic1', url: 'http://comic/url1' },
          { name: 'Comic2', url: 'http://comic/url2' }
        ]
      };
      fixture.detectChanges();

      const comicList = fixture.debugElement.queryAll(By.css('#comicList > option'));
      expect(comicList.length).toBe(2);
      expect((comicList[0].nativeNode as HTMLElement).textContent.trim()).toBe('Comic1 - http://comic/url1');
      expect((comicList[0].nativeNode as HTMLElement).attributes['value'].value).toBe('http://comic/url1');
    });
  });

  describe('remove selected comic from comic list', () => {

    beforeEach(() => {
      spyOn(service, 'removeComicData');

      component.appSettings = {
        comicList: [
          { name: 'Comic1', url: 'http://comic/url1' },
          { name: 'Comic2', url: 'http://comic/url2' }
        ]
      };
      fixture.detectChanges();
    });

    it('should call service.removeComicData()', fakeAsync(() => {
      component.selectedComic = component.appSettings.comicList[0].url;
      tick();

      const removeButton = fixture.debugElement.query(By.css('#removeFromComicList'));
      removeButton.triggerEventHandler('click', removeButton);

      expect(service.removeComicData).toHaveBeenCalledWith({ name: '', url: 'http://comic/url1' });
    }));

    it('should not call service.removeComicData() when not select any comic', fakeAsync(() => {
      component.selectedComic = undefined;
      tick();

      const removeButton = fixture.debugElement.query(By.css('#removeFromComicList'));
      removeButton.triggerEventHandler('click', removeButton);

      expect(service.removeComicData).not.toHaveBeenCalled();
    }));
  });

  describe('get comic images url list', () => {

    beforeEach(() => {
      spyOn(service, 'getImageList');

      component.appSettings = {
        comicList: [
          { name: 'Comic1', url: 'http://comic/url1' },
          { name: 'Comic2', url: 'http://comic/url2' }
        ]
      };
      fixture.detectChanges();
    });

    it('should call service.getImageList()', fakeAsync(() => {
      component.selectedComic = component.appSettings.comicList[0].url;
      tick();

      const getListButton = fixture.debugElement.query(By.css('#getPictureList'));
      getListButton.triggerEventHandler('click', getListButton);

      expect(service.getImageList).toHaveBeenCalledWith('http://comic/url1');
    }));

  });
});
