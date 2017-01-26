/* tslint:disable:no-unused-variable */
import { TestBed, async, fakeAsync, tick, inject } from '@angular/core/testing';
import { ComicDownloaderService } from './comic-downloader.service';
import { ElectronService } from './../shared/services/electron.service';

const os = window.require('os');
const fs = window.require('fs');
const mkdirp = require('mkdirp');

describe('ComicDownloaderService', () => {

  let service: ComicDownloaderService;
  let electronService: ElectronService;

  beforeEach(() => {
    spyOn(os, 'homedir').and.returnValue('/foo/bar');

    TestBed.configureTestingModule({
      providers: [ComicDownloaderService, ElectronService],

    });

    service = TestBed.get(ComicDownloaderService);
    electronService = TestBed.get(ElectronService);
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

    it('should call handleReadSettingError if read settings fail', () => {
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

    it('should call a callback after success', () => {
      const expectCallBack = jasmine.createSpyObj('expectedCallBack', ['callback']);
      spyOn(fs, 'readFile').and.callFake((path, callback) => {
        callback(null, new Buffer(JSON.stringify({})));
        expect(expectCallBack.callback).toHaveBeenCalled();
      })

      service.readSettings(expectCallBack.callback);
    });

    it('should have a promise version', done => {
      spyOn(service, 'readSettings').and.callFake((callback) => {
        callback();
      });

      service.readSettingsPromise().then((result) => {
        expect(service.readSettings).toHaveBeenCalled();
        done();
      });
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

  describe('when save comic folder setting', () => {
    beforeEach(() => {
      spyOn(electronService, 'openDirectoryDialog').and.returnValue(new Promise((resolve, reject) => {
        resolve('/foo/bar/new');
      }));
      spyOn(fs, 'writeFile');
    });

    it('should call ElectronService.showOpenDialog()', () => {
      service.appSettings = {
        comicFolder: '/foo/bar'
      };

      service.setComicFolder();

      expect(electronService.openDirectoryDialog).toHaveBeenCalledWith('/foo/bar');
    });

    it('should reset service.appSettings after select directory', fakeAsync(() => {
      service.appSettings = {
        comicFolder: '/foo/bar'
      };

      service.setComicFolder();
      tick();

      expect(service.appSettings.comicFolder).toBe('/foo/bar/new');
    }));

    it('should save new service.appSettings', fakeAsync(() => {
      service.appSettings = {
        comicFolder: '/foo/bar'
      };

      spyOn(service, 'getConfigFilePath').and.returnValue('/foo/bar/settings.conf');

      service.setComicFolder();
      tick();

      expect(fs.writeFile).toHaveBeenCalledWith('/foo/bar/settings.conf', JSON.stringify(service.appSettings));
    }));
  });

  describe('when cancel select save comic folder', () => {
    beforeEach(() => {
      spyOn(electronService, 'openDirectoryDialog').and.returnValue(new Promise((resolve, reject) => {
        resolve(undefined);
      }));
      spyOn(fs, 'writeFile');
    });

    it('should not save new service.appSettings whne cancel selection', fakeAsync(() => {
      service.appSettings = {
        comicFolder: '/foo/bar'
      };

      spyOn(service, 'getConfigFilePath').and.returnValue(undefined);

      service.setComicFolder();
      tick();

      expect(service.appSettings.comicFolder).toBe('/foo/bar');
      expect(fs.writeFile).toHaveBeenCalledTimes(0);
    }));
  });

  it('should call electronService.openDirectory() in service.openComicFolder()', () => {
    spyOn(electronService, 'openDirectory');
    service.appSettings = {
      comicFolder: '/foo/bar'
    };
    service.openComicFolder();

    expect(electronService.openDirectory).toHaveBeenCalledWith('/foo/bar');
  })
});
