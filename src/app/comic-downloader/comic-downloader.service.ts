import { ElectronService } from './../shared/services/electron.service';
import { Injectable } from '@angular/core';

const os = window.require('os');
const fs = window.require('fs');
const path = window.require('path');
const mkdirp = require('mkdirp');
const request = require('request');
const iconv = require('iconv-lite');

@Injectable()
export class ComicDownloaderService {

  appSettings: any;

  constructor(private electronService: ElectronService) { }

  getConfigFilePath() {
    return os.homedir() + '/8ComicDownloader/settings.conf';
  }

  updateSettings() {
    fs.writeFile(this.getConfigFilePath(), JSON.stringify(this.appSettings));
  }

  readSettings(callback?) {
    const configPath = this.getConfigFilePath();
    fs.readFile(configPath, (err, result) => {
      let tmpResult = result;
      if (err) {
        tmpResult = this.handleReadSettingError(err);
      }

      if (tmpResult !== undefined) {
        this.appSettings = JSON.parse(tmpResult.toString());
        if (typeof callback === 'function') {
          callback();
        }
      }
    });
  }

  readSettingsPromise() {
    return new Promise((resolve, reject) => {
      try {
        this.readSettings(() => {
          resolve(this.appSettings);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  handleReadSettingError(err) {
    if (err.toString().indexOf('no such file or directory') >= 0) {
      mkdirp.call(this, path.dirname(this.getConfigFilePath()), { fs: fs });

      const settings = {
        'comicFolder': path.dirname(this.getConfigFilePath()),
        'comicList': []
      };
      const writeResult = JSON.stringify(settings);
      fs.writeFile(this.getConfigFilePath(), writeResult);
      return new Buffer(writeResult);
    } else {
      throw err;
    }
  }

  setComicFolder() {
    this.electronService
      .openDirectoryDialog(this.appSettings.comicFolder)
      .then((newComicFolder) => {
        if (newComicFolder) {
          this.appSettings.comicFolder = newComicFolder;
          this.updateSettings();
        }
      });
  }

  openComicFolder() {
    this.electronService.openDirectory(this.appSettings.comicFolder);
  }

  addComicUrl(comicUrl) {
    this.checkComicUrlValid(comicUrl)
      .then((comicData: any) => {
        this.updateComicToAppSettings(comicData);
        this.updateSettings();
      });
  }

  updateComicToAppSettings(comicData) {
    const existComic = this.appSettings.comicList.filter((currentComic) => currentComic.url === comicData.url);
    if (existComic.length > 0) {
      existComic[0].name = comicData.name;
    } else {
      this.appSettings.comicList.push(comicData);
    }
  }

  checkComicUrlValid(comicUrl: string) {
    return new Promise((resolve, reject) => {
      const result = { name: '', url: '' };
      result.url = this.getCorrectComicUrl(comicUrl);
      this.getComicName(result.url).then((comicName: string) => {
        result.name = comicName;

        resolve(result);
      });
    });
  }

  getCorrectComicUrl(comicUrl: string) {
    const splitSlash = comicUrl.split('/');
    const splitDash = splitSlash[splitSlash.length - 1].split('-');
    const splitExtName = splitDash[splitDash.length - 1].split('.html');
    const comicId = splitExtName[0];
    return 'http://v.comicbus.com/online/comic-' + comicId + '.html?ch=1';
  }

  getComicName(comicUrl: string) {
    return new Promise((resolve, reject) => {
      this.getHtmlFromUrl(comicUrl).then((pageContent: string) => {
        const comicName = pageContent.split('<title>')[1].split('</title>')[0].split(' ')[0];
        resolve(comicName);
      });
    });
  }

  getHtmlFromUrl(targetUrl) {
    return new Promise((resolve, reject) => {
      const opt = {
        url: targetUrl,
        encoding: null
      };
      request.call(this, opt, (err, response, body) => {
        const result = this.handleRequestResult(err, response, body);
        if (result) {
          resolve(result);
        } else if (err) {
          reject(err);
        } else {
          reject('Response: ' + response.statusCode);
        }
      });
    });
  }

  handleRequestResult(err, response, body): any {
    if (err === null && response.statusCode === 200) {
      return iconv.decode(new Buffer(body), 'big5');
    } else {
      return null;
    }
  }

  removeComicData(comicData) {
    for (const index in this.appSettings.comicList) {
      if (this.appSettings.comicList[index].url === comicData.url) {
        this.appSettings.comicList.splice(index, 1);
        break;
      }
    }
    this.updateSettings();
  }
}
