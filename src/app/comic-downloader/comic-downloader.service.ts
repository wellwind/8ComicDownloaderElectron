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
    let configPath = this.getConfigFilePath();
    fs.readFile(configPath, (err, result) => {
      if(err){
        this.handleReadSettingError(err);
      }
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
