import { ComicImageInfo } from './../shared/interfaces/comic-image-info';
import { ComicImageDownloadStatus } from './../shared/enums/comic-image-download-status.enum';
import { Comic8Parser } from './../shared/parsers/8comic-parser';
import { ElectronService } from './../shared/services/electron.service';
import * as _ from 'lodash';
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
  toDownloadComicImageList: ComicImageInfo[];

  /**
   * 最大平行下載數
   */
  maxParallelDownloads = 5;

  /**
   * 目前佇列中下載數量
   */
  queuedDownloadTaskCount = 0;

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

  getImageList(comicUrl, lastVols = 0) {
    this.getHtmlFromUrl(comicUrl).then((content: string) => {
      const comicName = this.parseComicName(content);
      const code = content.split('var cs=\'')[1].split('\'')[0];
      const itemId = content.split('var ti=')[1].split(';')[0];

      let imageInfo = Comic8Parser.getComicUrls(code, itemId);
      if (lastVols > 0) {
        imageInfo = _.takeRight(imageInfo, lastVols);
      }

      this.toDownloadComicImageList = [];

      const result: ComicImageInfo[] = this.imageInfoListToDownloadList(imageInfo, comicName);

      this.toDownloadComicImageList = [...result];
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
      // TODO: 加入真正的下載邏輯
      setTimeout(() => {
        image.status = ComicImageDownloadStatus.Finish;
        resolve();
      }, Math.random() * 3000);
    });
  }

  startDownload(skipIfExist): Promise<any> {
    // TODO: 加入更適合的測試案例
    this.queuedDownloadTaskCount = 0;
    let currentTaskMaxIndex = this.maxParallelDownloads;

    const downloadTask = this.toDownloadComicImageList.map((image, index) => {
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          if (this.queuedDownloadTaskCount < this.maxParallelDownloads && index < currentTaskMaxIndex) {
            ++this.queuedDownloadTaskCount;
            this.downloadImage(image, skipIfExist).then(() => {
              --this.queuedDownloadTaskCount;
              ++currentTaskMaxIndex;
              resolve();
            });
            clearInterval(interval);
          }
        }, 500);
      });
    });

    return Promise.all(downloadTask);
  }
}
