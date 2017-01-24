/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ComicDownloaderService } from './comic-downloader.service';

describe('ComicDownloaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ComicDownloaderService]
    });
  });

  it('should ...', inject([ComicDownloaderService], (service: ComicDownloaderService) => {
    expect(service).toBeTruthy();
  }));
});
