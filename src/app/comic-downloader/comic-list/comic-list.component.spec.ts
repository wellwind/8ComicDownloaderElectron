/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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
});
