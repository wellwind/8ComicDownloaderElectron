import { ElectronService } from './../shared/services/electron.service';
/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ComicDownloaderService } from './comic-downloader.service';
const os = window.require('os');
const fs = window.require('fs');

describe('ComicDownloaderService', () => {

  beforeEach(() => {
    spyOn(os, 'homedir').and.returnValue('/foo/bar');

    TestBed.configureTestingModule({
      providers: [ComicDownloaderService]
    });
  });

  it('should have basic settings file path', inject([ComicDownloaderService], (service: ComicDownloaderService) => {
    expect(service.getConfigFilePath()).toBe('/foo/bar/8ComicDownloader/settings.conf');
  }));

  it('should call fs.readFile when calling readSettings', done => {
    const service = TestBed.get(ComicDownloaderService) as ComicDownloaderService;
    spyOn(fs, 'readFile').and.callFake((err, result) => {
      expect(true).toBeTruthy();
      done();
    });
    service.readSettings();
  });

  it('should call getConfigFilePath when calling readSettings', done => {
    const service = TestBed.get(ComicDownloaderService) as ComicDownloaderService;
    spyOn(service, 'getConfigFilePath');
    spyOn(fs, 'readFile').and.callFake((err, result) => {
      expect(service.getConfigFilePath).toHaveBeenCalled();
      done();
    });
    service.readSettings();    
  })
});
