/* tslint:disable:no-unused-variable */
import { TestBed, async, inject } from '@angular/core/testing';
import { ComicDownloaderService } from './comic-downloader.service';
import { ElectronService } from './../shared/services/electron.service';

const os = window.require('os');
const fs = window.require('fs');
const mkdirp = require('mkdirp');

describe('ComicDownloaderService', () => {

  let service: ComicDownloaderService;

  beforeEach(() => {
    spyOn(os, 'homedir').and.returnValue('/foo/bar');

    TestBed.configureTestingModule({
      providers: [ComicDownloaderService]
    });

    service = TestBed.get(ComicDownloaderService);
  });

  it('should have basic settings file path', inject([ComicDownloaderService], (service: ComicDownloaderService) => {
    expect(service.getConfigFilePath()).toBe('/foo/bar/8ComicDownloader/settings.conf');
  }));

  describe('when read settings', () => {
    it('should call fs.readFile when calling readSettings', () => {
      spyOn(fs, 'readFile');

      service.readSettings();

      expect(fs.readFile).toHaveBeenCalled();
    });

    it('should call getConfigFilePath when calling readSettings', done => {
      spyOn(service, 'getConfigFilePath');
      spyOn(fs, 'readFile').and.callFake((err, result) => {
        expect(service.getConfigFilePath).toHaveBeenCalled();
        done();
      });
      service.readSettings();
    });

    it('should call handleReadSettingError when read settings fail', () => {
      spyOn(service, 'handleReadSettingError');
      spyOn(service, 'getConfigFilePath').and.returnValue('/dev/null');

      spyOn(fs, 'readFile').and.callFake((path, callback) => {
        callback('error', null);
      });

      service.readSettings();
      expect(service.handleReadSettingError).toHaveBeenCalled();
    });

    it('should load settings to variable', done => {
      var fakeSetting = {
        foo: 'bar'
      };

      spyOn(fs, 'readFile').and.callFake((path, callback) => {
        callback(null, new Buffer(JSON.stringify(fakeSetting)));
        expect(JSON.stringify(service.appSettings)).toBe(JSON.stringify(fakeSetting));
        done();
      })

      service.readSettings();
    });
  });

  describe('when read settings got error', () => {
    beforeEach(() => {
      spyOn(mkdirp, 'call');
      spyOn(fs, 'writeFile');
    });

    it('should create directory when config file not exist', () => {
      const errMsg = 'ENOENT: no such file or directory';

      service.handleReadSettingError(errMsg);

      expect(mkdirp.call).toHaveBeenCalledWith(service, '/foo/bar/8ComicDownloader', { fs: fs });
    });

    it('should write default file when config fie not exist', () => {
      const errMsg = 'ENOENT: no such file or directory';
      let defaultSettings = {
        'comicFolder': '/foo/bar/8ComicDownloader',
        'comicList': []
      };

      service.handleReadSettingError(errMsg);

      expect(fs.writeFile).toHaveBeenCalledWith('/foo/bar/8ComicDownloader/settings.conf', JSON.stringify(defaultSettings));
    });

    it('should throw unknow error when read file fail', () => {
      const errMsg = 'unknown error';
      spyOn(service, 'handleReadSettingError').and.callThrough();

      expect(() => {
        service.handleReadSettingError(new Error(errMsg));
      }).toThrowError('unknown error');
    });
  });

});
