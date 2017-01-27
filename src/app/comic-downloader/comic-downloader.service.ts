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
    return os.homedir() + '/8ComicDownloader/settings.conf';;
  }

  updateSettings() {
    fs.writeFile(this.getConfigFilePath(), JSON.stringify(this.appSettings));
  }

  readSettings(callback?) {
    let configPath = this.getConfigFilePath();
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

      let settings = {
        'comicFolder': path.dirname(this.getConfigFilePath()),
        'comicList': []
      };
      var writeResult = JSON.stringify(settings);
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
    let existComic = this.appSettings.comicList.filter((currentComic) => currentComic.url === comicData.url);
    if (existComic.length > 0) {
      existComic[0].name = comicData.name;
    } else {
      this.appSettings.comicList.push(comicData);
    }
  }

  checkComicUrlValid(comicUrl: string) {
    return new Promise((resolve, reject) => {
      let result = {name: '', url: ''};
      resolve(result);
    });
  }

  getCorrectComicUrl(comicUrl: string) {
    let splitSlash = comicUrl.split('/');
    let splitDash = splitSlash[splitSlash.length - 1].split('-');
    let splitExtName = splitDash[splitDash.length - 1].split('.html');
    let comicId = splitExtName[0];
    return "http://v.comicbus.com/online/comic-" + comicId + ".html?ch=1";
  }

  getHtmlFromUrl(targetUrl) {
    return new Promise((resolve, reject) => {
      var opt = {
        url: targetUrl,
        encoding: null
      };
      request.call(this, opt, (err, response, body) => {
        var result = this.handleRequestResult(err, response, body);
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
}
