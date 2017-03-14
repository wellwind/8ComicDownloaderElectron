import * as _ from 'lodash';
import { ComicImageInfo } from './../shared/interfaces/comic-image-info';
import { ComicImageDownloadStatus } from './../shared/enums/comic-image-download-status.enum';
import { Comic8Parser } from './../shared/parsers/8comic-parser';
import { ElectronService } from './../shared/services/electron.service';
import { Injectable } from '@angular/core';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';

const os = window.require('os');
const fs = window.require('fs');
const path = window.require('path');
const http = window.require('http');
const mkdirp = require('mkdirp');
const request = require('request');
const iconv = require('iconv-lite');
const promiseLimit = require('promise-limit');

@Injectable()
export class ComicDownloaderService {
  electronApp: any;

  appSettings: any;
  toDownloadComicImageList: ComicImageInfo[];

  downloadProgress: Observable<number>;
  _downloadProgress: Observer<number>;

  /**
   * 最大平行下載數
   */
  maxParallelDownloads = 5;

  /**
   * 目前佇列中下載數量
   */
  queuedDownloadTaskCount = 0;

  constructor(private electronService: ElectronService) {
    this.toDownloadComicImageList = [];

    // TODO: 加入測試案例
    this.downloadProgress = Observable.create((observer: Observer<number>) => {
      this._downloadProgress = observer;
    });
  }

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
        const comicName = this.parseComicName(pageContent);
        resolve(comicName);
      });
    });
  }

  parseComicName(pageContent) {
    return pageContent.split('<title>')[1].split('</title>')[0].split(' ')[0];
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

  getImageList(comicUrl, lastVols = 0): Promise<any> {
    return this.getHtmlFromUrl(comicUrl).then((content: string) => {
      const comicName = this.parseComicName(content);
      const code = content.split('var cs=\'')[1].split('\'')[0];
      const itemId = content.split('var ti=')[1].split(';')[0];

      let imageInfo = Comic8Parser.getComicUrls(code, itemId);
      if (lastVols > 0) {
        imageInfo = _.takeRight(imageInfo, lastVols);
      }

      const result: ComicImageInfo[] = this.imageInfoListToDownloadList(imageInfo, comicName);

      this.toDownloadComicImageList = [...this.toDownloadComicImageList, ...result];
    });
  }

  imageInfoListToDownloadList(imageInfoList, comicName) {
    const result: ComicImageInfo[] = [];
    imageInfoList.forEach(info => {
      const vol = info.Vol;
      info.Urls.forEach((url: string) => {
        const urlSplit = url.split('/');
        const imageFileName = urlSplit[urlSplit.length - 1];
        result.push({
          savedPath: `${comicName}${path.sep}${vol}${path.sep}${imageFileName}`,
          imageUrl: url,
          status: ComicImageDownloadStatus.Ready
        });
      });
    });
    return result;
  }

  clearToDownloadImageList() {
    this.toDownloadComicImageList = [];
  }

  downloadImage(image: ComicImageInfo, skipIfExist: boolean) {
    return new Promise((resolve, reject) => {
      image.status = ComicImageDownloadStatus.Downloading;
      image.focusMe = true;

      const localSavedPath = this.appSettings.comicFolder + path.sep + image.savedPath;
      const exist = fs.existsSync(localSavedPath);
      if (!exist || !skipIfExist) {
        image.status = ComicImageDownloadStatus.Downloading;
        const downloadTmpPath = this.getDownloadTmpPath(localSavedPath);
        this.startDownloadImage(image.imageUrl, downloadTmpPath, localSavedPath).then(() => {
          image.status = ComicImageDownloadStatus.Finish;

          this._downloadProgress.next(this.getDownloadProgress());
          resolve();
        });
      } else {
        image.status = ComicImageDownloadStatus.Exist;

        this._downloadProgress.next(this.getDownloadProgress());
        resolve();
      }
    });
  }

  getDownloadTmpPath(savedPath) {
    // TODO: 加入測試案例
    return os.tmpdir() + path.sep + path.basename(savedPath);
  }

  startDownloadImage(url, tmpPath, finalPath) {
    // TODO: 加入測試案例
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(tmpPath);
      http.get(url, (response) => {
        // TODO: 加入錯誤處理
        response.pipe(file);
        mkdirp.call(this, path.dirname(finalPath), { fs: fs });
        file.on('finish', () => {
          this.moveFile(tmpPath, finalPath, () => {
            resolve();
          });
        });
      });
    });
  }

  moveFile(fromPath, toPath, callback) {
    // TODO: 加入測試案例
    const streamFrom = fs.createReadStream(fromPath);
    const streamTo = fs.createWriteStream(toPath);

    streamFrom.pipe(streamTo);
    streamFrom.on('end', function () {
      fs.unlinkSync(fromPath);
      callback();
    });
  }

  startDownload(skipIfExist): Promise<any> {
    // TODO: 加入更適合的測試案例
    const limit = promiseLimit(this.maxParallelDownloads);
    return Promise.all(this.toDownloadComicImageList.map(image =>
      limit(() =>
        this.downloadImage(image, skipIfExist)
      )
    ));
  }

  getDownloadProgress() {
    if (!this.toDownloadComicImageList) {
      return 0;
    }

    const totalRecordsCount = this.toDownloadComicImageList.length;

    if (totalRecordsCount === 0) {
      return 0;
    }

    const finishedRecordsCount =
      this.toDownloadComicImageList
        .filter(data =>
          data.status === ComicImageDownloadStatus.Error
          || data.status === ComicImageDownloadStatus.Finish
          || data.status === ComicImageDownloadStatus.Exist)
        .length;

    return parseInt((finishedRecordsCount * 100 / totalRecordsCount).toString(), 0);
  }
}
