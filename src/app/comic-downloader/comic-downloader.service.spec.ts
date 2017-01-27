/* tslint:disable:no-unused-variable */
import { TestBed, async, fakeAsync, tick, inject } from '@angular/core/testing';
import { ComicDownloaderService } from './comic-downloader.service';
import { ElectronService } from './../shared/services/electron.service';

const os = window.require('os');
const fs = window.require('fs');
const mkdirp = require('mkdirp');
const request = require('request');
const iconv = require('iconv-lite');

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

  it('should have basic settings file path', () => {
    expect(service.getConfigFilePath()).toBe('/foo/bar/8ComicDownloader/settings.conf');
  });

  it('sould save settings', () => {
    service.appSettings = { foo: 'bar' };
    spyOn(service, 'getConfigFilePath').and.returnValue('/foo/bar/settings.conf');
    spyOn(fs, 'writeFile');

    service.updateSettings();

    expect(service.getConfigFilePath).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledWith('/foo/bar/settings.conf', JSON.stringify(service.appSettings));
  });

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
      const fakeSetting = {
        foo: 'bar'
      };

      spyOn(fs, 'readFile').and.callFake((path, callback) => {
        callback(null, new Buffer(JSON.stringify(fakeSetting)));
        expect(JSON.stringify(service.appSettings)).toBe(JSON.stringify(fakeSetting));
        done();
      });

      service.readSettings();
    });

    it('should call a callback after success', () => {
      const expectCallBack = jasmine.createSpyObj('expectedCallBack', ['callback']);
      spyOn(fs, 'readFile').and.callFake((path, callback) => {
        callback(null, new Buffer(JSON.stringify({})));
        expect(expectCallBack.callback).toHaveBeenCalled();
      });

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
      const defaultSettings = {
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
  });

  describe('add comic url', () => {
    beforeEach(() => {
      spyOn(service, 'getConfigFilePath').and.returnValue('/foo/bar/settings.conf');
      spyOn(fs, 'writeFile');
    });

    it('should check url is valid', () => {
      spyOn(service, 'checkComicUrlValid').and.returnValue({ then: () => { }, reject: () => { } });

      service.addComicUrl('foo');

      expect(service.checkComicUrlValid).toHaveBeenCalledWith('foo');
    });

    it('should return comic data when call checkComicUrlValid()', done => {
      spyOn(service, 'getCorrectComicUrl').and.returnValue('http://foo/bar/test');
      spyOn(service, 'getComicName').and.returnValue(new Promise((resolve, reject) => {
        resolve('ComicName');
      }));

      service.checkComicUrlValid('http://foo/bar').then(result => {
        expect(result).toEqual({ name: 'ComicName', url: 'http://foo/bar/test' });
        done();
      });
    });

    it('should use comic volume url to get comic name', fakeAsync(() => {
      spyOn(service, 'getCorrectComicUrl').and.returnValue('http://foo/bar/volume');
      spyOn(service, 'getComicName').and.returnValue({ then: () => { } });

      service.checkComicUrlValid('http://foo/bar');
      tick();

      expect(service.getComicName).toHaveBeenCalledWith('http://foo/bar/volume');
    }));

    it('should get comic name from url', done => {
      spyOn(service, 'getHtmlFromUrl').and.returnValue(new Promise((resolve, reject) => {
        resolve('<title>ComicName is here</title>');
      }));

      service.getComicName('http://foo/bar').then(comicName => {
        expect(comicName).toBe('ComicName');
        done();
      });
    });

    it('should add url to appSettings', fakeAsync(() => {
      service.appSettings = {
        comicList: []
      };

      const newComicData = {
        name: 'comicName',
        url: 'http://foo/bar'
      };

      spyOn(service, 'checkComicUrlValid').and.returnValue(new Promise((resolve, reject) => {
        resolve(newComicData);
      }));

      service.addComicUrl('test url...');
      tick();

      expect(service.appSettings.comicList).toContain(newComicData);
    }));

    it('should update comic if exist', fakeAsync(() => {
      service.appSettings = {
        comicList: [
          { name: 'comicName0', url: 'http://foo/bar/0' },
          { name: 'comicNameCurrent', url: 'http://foo/bar/replace' },
          { name: 'comicName1', url: 'http://foo/bar/1' },
        ]
      };

      const newComicData = {
        name: 'comicNameNew',
        url: 'http://foo/bar/replace'
      };

      spyOn(service, 'checkComicUrlValid').and.returnValue(new Promise((resolve, reject) => {
        resolve(newComicData);
      }));

      service.addComicUrl('http://foo/bar/');
      tick();

      expect(service.appSettings.comicList[1]).toEqual(newComicData);
    }));

    it('should save new appSettings after add comic url', fakeAsync(() => {
      service.appSettings = {
        comicList: []
      };

      const newComicData = {
        name: 'comicName',
        url: 'http://foo/bar'
      };

      spyOn(service, 'checkComicUrlValid').and.returnValue(new Promise((resolve, reject) => {
        resolve(newComicData);
      }));

      service.addComicUrl('test url...');
      tick();

      expect(fs.writeFile).toHaveBeenCalledWith('/foo/bar/settings.conf', JSON.stringify(service.appSettings));
    }));
  });

  describe('valid comic url', () => {
    it('should return correct url when use comic page url', () => {
      const testUrl = 'http://v.comicbus.com/html/102.html';
      const expected = 'http://v.comicbus.com/online/comic-102.html?ch=1';

      const actual = service.getCorrectComicUrl(testUrl);

      expect(actual).toBe(expected);
    });

    it('should return the first volumn use comic volume url', () => {
      const testUrl = 'http://v.comicbus.com/online/comic-102.html?ch=999';
      const expected = 'http://v.comicbus.com/online/comic-102.html?ch=1';

      const actual = service.getCorrectComicUrl(testUrl);

      expect(actual).toBe(expected);
    });
  });

  describe('get url content', () => {
    it('should do a right request', fakeAsync(() => {
      let actualOpt;
      const requestOpts = {
        url: 'http://foo/bar',
        encoding: null,
      };
      spyOn(request, 'call').and.callFake((obj, opt, cb) => {
        actualOpt = opt;
      });

      service.getHtmlFromUrl('http://foo/bar');
      tick();

      expect(request.call).toHaveBeenCalled();
      expect(actualOpt).toEqual(requestOpts);
    }));

    it('should call handleRequestResult after request finish', fakeAsync(() => {
      spyOn(request, 'call').and.callFake((obj, opt, cb) => {
        cb(null, { statusCode: 200 }, '');
      });
      spyOn(service, 'handleRequestResult').and.returnValue('response');

      service.getHtmlFromUrl('http://foo/bar');
      tick();

      expect(service.handleRequestResult).toHaveBeenCalledWith(null, { statusCode: 200 }, '');
    }));

    it('should return null when request has error', fakeAsync(() => {
      spyOn(request, 'call').and.callFake((obj, opt, cb) => {
        cb('error message', { statusCode: 500 }, null);
      });
      spyOn(service, 'handleRequestResult').and.callThrough();

      let actualError;
      service.getHtmlFromUrl('http://foo/bar').catch(err => {
        actualError = err;
      });
      tick();

      expect('error message').toBe(actualError);
    }));

    it('should return error when response status code not equals 200', fakeAsync(() => {
      spyOn(request, 'call').and.callFake((obj, opt, cb) => {
        cb(null, { statusCode: 500 }, null);
      });
      spyOn(service, 'handleRequestResult').and.callThrough();

      let actualError;
      service.getHtmlFromUrl('http://foo/bar').catch(err => {
        actualError = err;
      });
      tick();

      expect('Response: 500').toBe(actualError);
    }));

    it('should return result when response status code is 200', fakeAsync(() => {
      spyOn(request, 'call').and.callFake((obj, opt, cb) => {
        cb(null, { statusCode: 200 }, 'html content...');
      });
      spyOn(service, 'handleRequestResult').and.callThrough();

      let actualResponse;
      service.getHtmlFromUrl('http://foo/bar').then(responseText => {
        actualResponse = responseText;
      });
      tick();

      expect('html content...').toBe(actualResponse);
    }));
  });

  it('handleRequestResult should call iconv.decode', () => {
    spyOn(iconv, 'decode');

    service.handleRequestResult(null, { statusCode: 200 }, 'data...');

    expect(iconv.decode).toHaveBeenCalledWith(new Buffer('data...'), 'big5');
  });
});
