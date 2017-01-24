/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ComicDownloaderService } from './comic-downloader.service';
const os = window.require('os');

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
});
