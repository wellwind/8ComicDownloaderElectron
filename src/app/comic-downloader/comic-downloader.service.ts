import { Injectable } from '@angular/core';
import { mkdirp } from 'mkdirp';

const os = window.require('os');
const fs = window.require('fs');
const path = window.require('path');

@Injectable()
export class ComicDownloaderService {
  constructor() { }

  getConfigFilePath() {
    return os.homedir() + '/8ComicDownloader/settings.conf';;
  }

  readSettings() {
    fs.readFile(this.getConfigFilePath(), function (err, result) {
    });
  }

  handleReadSettingError(err) {
    if (err.toString().indexOf('no such file or directory') >= 0) {
      mkdirp.call(path.dirname(this.getConfigFilePath()));

      let settings = {
        'comicFolder': path.dirname(this.getConfigFilePath()),
        'comicList': []
      };
      fs.writeFile(this.getConfigFilePath(), JSON.stringify(settings));
    }
  }
}
