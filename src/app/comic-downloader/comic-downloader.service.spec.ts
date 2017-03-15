import { ComicImageInfo } from './../shared/interfaces/comic-image-info';
import { Comic8Parser } from './../shared/parsers/8comic-parser';
import { ComicImageDownloadStatus } from './../shared/enums/comic-image-download-status.enum';
import { TestBed, async, fakeAsync, tick, inject } from '@angular/core/testing';
import { ComicDownloaderService } from './comic-downloader.service';
import { ElectronService } from './../shared/services/electron.service';

const os = window.require('os');
const fs = window.require('fs');
const http = window.require('http');
const path = window.require('path');
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

  describe('remove comic data', () => {
    beforeEach(() => {
      spyOn(service, 'updateSettings');
    });
    it('should remove comic data', () => {
      service.appSettings = {
        comicList: [
          { name: 'Comic1', url: 'http://foo/bar/comic1' },
          { name: 'Comic2', url: 'http://foo/bar/comic2' },
        ]
      };

      service.removeComicData({ name: 'Comic1', url: 'http://foo/bar/comic1' });

      expect(service.appSettings.comicList.length).toBe(1);
      expect(service.appSettings.comicList[0]).toEqual({ name: 'Comic2', url: 'http://foo/bar/comic2' });
    });

    it('should call service.updateSetting() after remove comic data', () => {
      service.appSettings = {
        comicList: []
      };
      service.removeComicData({});

      expect(service.updateSettings).toHaveBeenCalled();
    });
  });

  describe('get comic image list', () => {
    beforeEach(() => {
      spyOn(service, 'getHtmlFromUrl').and.returnValue(new Promise((resolve, reject) => {
        resolve('...var cs=\'code\'.....var ti=itemId;.....');
      }));

      spyOn(Comic8Parser, 'getComicUrls').and.returnValue([
        {
          Vol: '0001',
          Urls: [
            'http://comic/0001/image01.jpg',
            'http://comic/0001/image02.jpg',
          ]
        },
        {
          Vol: '0002',
          Urls: [
            'http://comic/0002/image01.jpg',
            'http://comic/0002/image02.jpg',
          ]
        },
        {
          Vol: '0003',
          Urls: [
            'http://comic/0003/image01.jpg',
            'http://comic/0003/image02.jpg',
          ]
        },
        {
          Vol: '0004',
          Urls: [
            'http://comic/0004/image01.jpg',
            'http://comic/0004/image02.jpg',
          ]
        }
      ]);

      spyOn(service, 'parseComicName').and.returnValue('TestComic');
    });

    it('should call getHtmlFromUrl with comicUrl', () => {
      service.getImageList('http://comic/url');

      expect(service.getHtmlFromUrl).toHaveBeenCalledWith('http://comic/url');
    });

    it('should call Comic8Parser.getComicUrls with itemId and code', fakeAsync(() => {
      service.getImageList('http://comic/url');
      tick();

      expect(Comic8Parser.getComicUrls).toHaveBeenCalledWith('code', 'itemId');
    }));

    it('should set toDownloadComicImageList correctly', fakeAsync(() => {
      const expected: ComicImageInfo[] = [
        {
          savedPath: `TestComic${path.sep}0001${path.sep}image01.jpg`,
          imageUrl: 'http://comic/0001/image01.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}0001${path.sep}image02.jpg`,
          imageUrl: 'http://comic/0001/image02.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}0002${path.sep}image01.jpg`,
          imageUrl: 'http://comic/0002/image02.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}0002${path.sep}image02.jpg`,
          imageUrl: 'http://comic/0002/image02.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}0003${path.sep}image01.jpg`,
          imageUrl: 'http://comic/0003/image01.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}0003${path.sep}image02.jpg`,
          imageUrl: 'http://comic/0003/image02.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}0004${path.sep}image01.jpg`,
          imageUrl: 'http://comic/0004/image01.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}0004${path.sep}image02.jpg`,
          imageUrl: 'http://comic/0004/image02.jpg',
          status: ComicImageDownloadStatus.Ready
        },
      ];

      service.getImageList('http://comic/url');
      tick();

      expect(service.toDownloadComicImageList.length).toEqual(expected.length);
      expect(service.toDownloadComicImageList[0]).toEqual(expected[0]);
      expect(service.toDownloadComicImageList[7]).toEqual(expected[7]);
    }));

    it('should append to current toDownloadComicImageList', fakeAsync(() => {
      service.toDownloadComicImageList = [
        {
          savedPath: `TestComic${path.sep}9999${path.sep}image01.jpg`,
          imageUrl: 'http://comic/9999/image01.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}9999${path.sep}image02.jpg`,
          imageUrl: 'http://comic/9999/image02.jpg',
          status: ComicImageDownloadStatus.Ready
        }
      ];

      const expected: ComicImageInfo[] = [
        {
          savedPath: `TestComic${path.sep}9999${path.sep}image01.jpg`,
          imageUrl: 'http://comic/9999/image01.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}9999${path.sep}image02.jpg`,
          imageUrl: 'http://comic/9999/image02.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}0001${path.sep}image01.jpg`,
          imageUrl: 'http://comic/0001/image01.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}0001${path.sep}image02.jpg`,
          imageUrl: 'http://comic/0001/image02.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}0002${path.sep}image01.jpg`,
          imageUrl: 'http://comic/0002/image02.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}0002${path.sep}image02.jpg`,
          imageUrl: 'http://comic/0002/image02.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}0003${path.sep}image01.jpg`,
          imageUrl: 'http://comic/0003/image01.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}0003${path.sep}image02.jpg`,
          imageUrl: 'http://comic/0003/image02.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}0004${path.sep}image01.jpg`,
          imageUrl: 'http://comic/0004/image01.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}0004${path.sep}image02.jpg`,
          imageUrl: 'http://comic/0004/image02.jpg',
          status: ComicImageDownloadStatus.Ready
        },
      ];

      service.getImageList('http://comic/url');
      tick();

      expect(service.toDownloadComicImageList.length).toEqual(expected.length);
      expect(service.toDownloadComicImageList[0]).toEqual(expected[0]);
      expect(service.toDownloadComicImageList[9]).toEqual(expected[9]);
    }));

    it('should set toDownloadComicImageList correctly if want last N vols', fakeAsync(() => {
      service.getImageList('http://comic/url', 2);
      tick();

      const expected: ComicImageInfo[] = [
        {
          savedPath: `TestComic${path.sep}0003${path.sep}image01.jpg`,
          imageUrl: 'http://comic/0003/image01.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}0003${path.sep}image02.jpg`,
          imageUrl: 'http://comic/0003/image02.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}0004${path.sep}image01.jpg`,
          imageUrl: 'http://comic/0004/image01.jpg',
          status: ComicImageDownloadStatus.Ready
        },
        {
          savedPath: `TestComic${path.sep}0004${path.sep}image02.jpg`,
          imageUrl: 'http://comic/0004/image02.jpg',
          status: ComicImageDownloadStatus.Ready
        },
      ];

      expect(service.toDownloadComicImageList.length).toEqual(expected.length);
      expect(service.toDownloadComicImageList[0]).toEqual(expected[0]);
      expect(service.toDownloadComicImageList[3]).toEqual(expected[3]);
    }));

    describe('start download', () => {
      it('should call downloadImage N times', (done) => {
        service.toDownloadComicImageList = [
          {
            savedPath: `TestComic${path.sep}0003${path.sep}image01.jpg`,
            imageUrl: 'http://comic/0003/image01.jpg',
            status: ComicImageDownloadStatus.Ready
          },
          {
            savedPath: `TestComic${path.sep}0003${path.sep}image02.jpg`,
            imageUrl: 'http://comic/0003/image02.jpg',
            status: ComicImageDownloadStatus.Ready
          },
          {
            savedPath: `TestComic${path.sep}0004${path.sep}image01.jpg`,
            imageUrl: 'http://comic/0004/image01.jpg',
            status: ComicImageDownloadStatus.Ready
          },
          {
            savedPath: `TestComic${path.sep}0004${path.sep}image02.jpg`,
            imageUrl: 'http://comic/0004/image02.jpg',
            status: ComicImageDownloadStatus.Ready
          },
        ];

        spyOn(service, 'downloadImage').and.returnValue(new Promise((resolve, reject) => {
          resolve();
        }));

        service.startDownload(true).then(() => {
          expect(service.downloadImage).toHaveBeenCalledTimes(4);
          done();
        });
      });
    });

    describe('clearToDownloadImageList()', () => {
      it('should clear the toDownloadImageList', () => {
        service.toDownloadComicImageList = [{
          savedPath: `TestComic${path.sep}0004${path.sep}image02.jpg`,
          imageUrl: 'http://comic/0004/image02.jpg',
          status: ComicImageDownloadStatus.Ready
        }];

        service.clearToDownloadImageList();

        expect(service.toDownloadComicImageList).toEqual([]);
      });
    });

    describe('downloadImage()', () => {
      beforeEach(() => {
        service.appSettings = {
          comicFolder: '/home/'
        };

        service._downloadProgress = {
          next: () => {},
          error: () => {},
          complete: () => {}
        };
      });

      it('should run download if file not exist', fakeAsync(() => {
        const image: ComicImageInfo = {
          imageUrl: 'http://foo/bar/comic.jpg',
          savedPath: 'foo/bar/comic.jpg',
          status: ComicImageDownloadStatus.Ready
        };

        spyOn(fs, 'accessSync').and.returnValue(false);
        spyOn(http, 'get');

        service.downloadImage(image, false);
        tick();

        expect(http.get).toHaveBeenCalled();
      }));

      it('should not run download if file exist and skipIfExist is true', fakeAsync(() => {
        const image: ComicImageInfo = {
          imageUrl: 'http://foo/bar/comic.jpg',
          savedPath: '/home/foo/bar/comic.jpg',
          status: ComicImageDownloadStatus.Ready
        };

        spyOn(fs, 'accessSync').and.returnValue(true);
        spyOn(http, 'get');

        service.downloadImage(image, true);
        tick();

        expect(http.get).not.toHaveBeenCalled();
        expect(image.status).toBe(ComicImageDownloadStatus.Exist);
      }));

      it('should run download if file exist but skipIfExist is false', fakeAsync(() => {
        const image: ComicImageInfo = {
          imageUrl: 'http://foo/bar/comic.jpg',
          savedPath: '/home/foo/bar/comic.jpg',
          status: ComicImageDownloadStatus.Ready
        };

        spyOn(fs, 'accessSync').and.returnValue(true);
        spyOn(http, 'get');

        service.downloadImage(image, false);
        tick();

        expect(http.get).toHaveBeenCalled();
      }));

      it('should call service.startDownloadImage when download', fakeAsync(() => {
        const image: ComicImageInfo = {
          imageUrl: 'http://foo/bar/comic.jpg',
          savedPath: '/home/foo/bar/comic.jpg',
          status: ComicImageDownloadStatus.Ready
        };

        spyOn(fs, 'accessSync').and.returnValue(false);
        spyOn(service, 'getDownloadTmpPath').and.returnValue('/tmp');
        spyOn(service, 'startDownloadImage').and.returnValue(new Promise((resolve, reject) => {
          resolve();
        }));
        const expectedSavedPath = service.appSettings.comicFolder + path.sep + image.savedPath;
        service.downloadImage(image, false);
        tick();

        expect(service.startDownloadImage).toHaveBeenCalledWith(image.imageUrl, '/tmp', expectedSavedPath);
        expect(image.status).toBe(ComicImageDownloadStatus.Finish);
      }));
    });
  });

  it('should caculate downloading progress', () => {
    service.toDownloadComicImageList = [];
    expect(service.getDownloadProgress()).toBe(0);

    service.toDownloadComicImageList = [{
      savedPath: '',
      imageUrl: '',
      status: ComicImageDownloadStatus.Ready
    }, {
      savedPath: '',
      imageUrl: '',
      status: ComicImageDownloadStatus.Error
    }, {
      savedPath: '',
      imageUrl: '',
      status: ComicImageDownloadStatus.Exist
    }, {
      savedPath: '',
      imageUrl: '',
      status: ComicImageDownloadStatus.Downloading
    }, {
      savedPath: '',
      imageUrl: '',
      status: ComicImageDownloadStatus.Finish
    }];

    expect(service.getDownloadProgress()).toBe(60);

    service.toDownloadComicImageList = [{
      savedPath: '',
      imageUrl: '',
      status: ComicImageDownloadStatus.Error
    }, {
      savedPath: '',
      imageUrl: '',
      status: ComicImageDownloadStatus.Exist
    }, {
      savedPath: '',
      imageUrl: '',
      status: ComicImageDownloadStatus.Finish
    }];

    expect(service.getDownloadProgress()).toBe(100);
  });
});
