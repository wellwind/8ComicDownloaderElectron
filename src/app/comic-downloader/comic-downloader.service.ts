import { Injectable } from '@angular/core';
const os = window.require('os');
const fs = window.require('fs');

@Injectable()
export class ComicDownloaderService {
  constructor() { }

  getConfigFilePath() {
    
    return os.homedir() + '/8ComicDownloader/settings.conf';;
  }

  readSettings() {
    fs.readFile(this.getConfigFilePath(), function(err, result){

    });
  }
}
