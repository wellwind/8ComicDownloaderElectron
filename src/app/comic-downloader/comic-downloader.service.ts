import { Injectable } from '@angular/core';

const os = window.require('os');
const fs = window.require('fs');
const path = window.require('path');
const mkdirp = require('mkdirp');

@Injectable()
export class ComicDownloaderService {

  appSettings: any;

  constructor() { }

  getConfigFilePath() {
    return os.homedir() + '/8ComicDownloader/settings.conf';;
  }

  readSettings() {
    let configPath = this.getConfigFilePath();
    fs.readFile(configPath, (err, result) => {
      if (err) {
        this.handleReadSettingError(err);
      } else {
        this.appSettings = JSON.parse(result.toString());
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
      fs.writeFile(this.getConfigFilePath(), JSON.stringify(settings));
    } else {
      throw err;
    }
  }
}
